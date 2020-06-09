import { generateExternalWindowSnapshot, restoreExternalWindowPositionAndState } from './external-window-snapshot.js';
import { URLS_ARRAY } from './constants.js';

//We have customized out platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        title: 'my_platform_notes - Notepad'
    }
];

const pooledViews = {};
const createPooledView = async (url) => {
    console.log('about to create');
    const view = await fin.Platform.getCurrentSync().createView({ url }, fin.me.identity);
    pooledViews[url] = view.identity.name;
};

fin.Platform.getCurrentSync().once('platform-snapshot-applied', () => URLS_ARRAY.forEach(createPooledView));

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
                if (snapshot.externalWindows) {
                    await Promise.all(snapshot.externalWindows.map(async (i) => await restoreExternalWindowPositionAndState(i)));
                }

                return originalPromise;
            }
        };
        return new Override();
    }
});
