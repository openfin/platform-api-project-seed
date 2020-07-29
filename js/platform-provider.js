import { generateExternalWindowSnapshot, restoreExternalWindowPositionAndState } from './external-window-snapshot.js';
import { URLS_ARRAY } from './constants.js';

//We have customized our platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        // Note that this is only the beginning of the title.
        // In `getExternalWindowByNameTitle`, we will just check that the title starts with this string.
        // This is in order to work with both 'my_platform_notes' and 'my_platform_notes.txt', depending on
        // the user's settings for viewing file extensions.
        title: 'my_platform_notes'
    }
];

const pooledViews = {};
const createPooledView = async (url) => {
    console.log('about to create');
    const view = await fin.Platform.getCurrentSync().createView({ url, detachOnClose: true }, fin.me.identity);
    pooledViews[url] = view.identity.name;
};

fin.Platform.getCurrentSync().once('platform-snapshot-applied', () => URLS_ARRAY.forEach(createPooledView));

function modifyContentItemName(
    contentItem,
    shouldReplace,
    url
) {
    const name = generateViewNameIfNeeded(contentItem.componentState.name, shouldReplace, url);
    const newComponentState = { ...contentItem.componentState, name };
    return { ...contentItem, componentState: newComponentState };
}

function generateViewNameIfNeeded(name, shouldReplace, url) {
    // either the view has no name OR it is being restored and has a generated name
    if(shouldReplace && name.startsWith('internal-generated-view-')) {
        console.log('replacing name');
        const name = pooledViews[url];
        setTimeout(() => createPooledView(url),1);
        delete pooledViews[url];
        return name;
    }
    return name;
}

function mapLayoutContentItems(
    contentItems,
    action
) {
    return contentItems.reduce((res, contentItem) => {
        let modifiedContentItemContent = contentItem.content;
        const modifiedContentItem = contentItem.type === 'component' ? action(contentItem) : contentItem;
        if (contentItem.content) {
            modifiedContentItemContent = mapLayoutContentItems(contentItem.content, action);
        }
        return [...res, { ...modifiedContentItem, content: modifiedContentItemContent }];
    }, []);
}

fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
            async createView(payload) {
                const { opts } = payload;
                if (!opts.name && pooledViews[opts.url]) {
                    console.log('replacing name');
                    opts.name = pooledViews[opts.url];
                    delete pooledViews[opts.url];
                    setTimeout(() => createPooledView(opts.url),1);
                }
                return super.createView(payload);
            }

            async createWindow(payload) {
                if (payload.layout) {
                    payload.layout.content = mapLayoutContentItems(
                        payload.layout.content,
                        (contentItem) =>
                            modifyContentItemName(
                                contentItem,
                                payload.reason !== 'tearout' && pooledViews[contentItem.componentState.url],
                                contentItem.componentState.url
                            )
                    );
                }
                super.createWindow(payload)
            }
            async getSnapshot() {
                const snapshot = await super.getSnapshot();

                //we add an externalWindows section to our snapshot
                const externalWindows = await generateExternalWindowSnapshot(externalWindowsToTrack);
                return {
                    ...snapshot,
                    externalWindows
                };
            }

            async applySnapshot({ snapshot, options }) {

                const originalPromise = super.applySnapshot({ snapshot, options });

                //if we have a section with external windows we will use it.
                if (snapshot.externalWindows && snapshot.externalWindows.length) {
                    await Promise.all(snapshot.externalWindows.map(async (i) => await restoreExternalWindowPositionAndState(i)));
                }

                return originalPromise;
            }
        };
        return new Override();
    }
});
