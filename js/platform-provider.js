import Logger from './logger.js';

//We have customized out platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        title: 'my_platform_notes - Notepad'
    }
];

const logger = new Logger();
logger.push('before-platform-init');

fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
            async createWindow(options) {
                // const identity = {name: options.name, uuid: fin.me.identity.uuid};
                // const w = fin.Window.wrapSync(identity);
                // setupViewListeners(options.layout.content[0]);
                logger.push(`creating-window`, {name: options.name || 'nameless window'}, 'right before createWindow is called');
                const win = await super.createWindow(options);
                setupWindowListeners(win);
                setupViewListeners(options.layout && options.layout.content[0]);
                logger.push(`created-window`, {name: options.name}, 'right after createWindow resolves');

                return win;
            }
        };
        return new Override();
    }
}).then(payload => {
    logger.push(`after-platform-init`, payload, 'right after platform.init is resolved');

    const p = fin.Platform.getCurrentSync();
    setupPlatformListeners(p);
});

function getAllViewConfigs(layoutContent) {
    const res = [];
    layoutContent.content.forEach((contentItem) => {
        if (contentItem.type === 'component') {
            res.push(contentItem.componentState);
        } else {
            res.push(...getAllViewConfigs(contentItem));
        }
    });
    return res;
}

function setupWindowListeners(window) {
    window.on('layout-initialized', event => logger.push('layout-initialized', event, 'api event'));
    window.on('window-initialized', event => logger.push('window-initialized', event, 'api event'));
    window.on('shown', event => logger.push('window-shown', event, 'api event'));
}

function setupViewListeners(layoutContent) {
    const allViewsConfigs = getAllViewConfigs(layoutContent);
    allViewsConfigs.forEach(viewConfig => {
        const view = fin.View.wrapSync({name: viewConfig.name, uuid: fin.me.identity.uuid});
        view.on('target-changed', event => logger.push('view-target-changed', event, 'api event'));
        view.on('created', event => logger.push('view-created', event, 'api event'));
    });
}

function setupPlatformListeners(platform) {
    platform.on('platform-api-ready', event => logger.push('platform-api-ready', event));
    platform.on('platform-snapshot-applied', event => logger.push('platform-snapshot-applied', event, 'api event'));
}

window.logger = logger;