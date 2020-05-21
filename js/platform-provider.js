import { generateExternalWindowSnapshot, restoreExternalWindowPositionAndState } from './external-window-snapshot.js';

//We have customized out platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        title: 'my_platform_notes - Notepad'
    }
];

const baselineTime = Date.now();
var diagnosticData = [];
diagnosticData.push({event: 'before-platform-init', time: 0, dt: 0});

fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
            async createWindow(options) {
                const identity = {name: options.name, uuid: fin.me.identity.uuid};
                const w = fin.Window.wrapSync(identity);
                w.on('layout-initialized', event => diagnosticData.push(buildPerformanceEvent('layout-initialized', event)));
                w.on('layout-ready', event => diagnosticData.push(buildPerformanceEvent('layout-ready', event)));
                w.on('window-initialized', event => diagnosticData.push(buildPerformanceEvent('window-initialized', event)));
                w.on('shown', event => diagnosticData.push(buildPerformanceEvent('window-shown', event)));

                attachViewPerformanceListeners(options.layout.content[0], identity);
                diagnosticData.push(buildPerformanceEvent(`creating-window`, {name: options.name}));
                const res = await super.createWindow(options);
                diagnosticData.push(buildPerformanceEvent(`created-window`, {name: options.name}));

                return res;
            }
        };
        return new Override();
    }
}).then(() => {
    const p = fin.Platform.getCurrentSync();
    diagnosticData.push(buildPerformanceEvent('after-platform-init'))
    p.on('platform-api-ready', () => diagnosticData.push(buildPerformanceEvent('platform-api-ready')));
    p.on('platform-snapshot-applied', () => diagnosticData.push(buildPerformanceEvent('platform-snapshot-applied')));
});

function buildPerformanceEvent(eventName, args = {}) {
    const time = Date.now() - baselineTime;
    const dt = time - diagnosticData[diagnosticData.length - 1].time;
    return {event: eventName, time, dt, args: JSON.stringify(args)};
}

window.getPerformanceReport = function() {
    console.table(diagnosticData);
}

// view.on('target-changed', (payload) => {

// });

function attachViewPerformanceListeners(layoutContent, targetIdentity) {
    const allViewsConfigs = getAllViewConfigs(layoutContent);
    allViewsConfigs.forEach(viewConfig => {
        const view = fin.View.wrapSync({name: viewConfig.name, uuid: fin.me.identity.uuid});
        view.on('target-changed', event => event.target.name === targetIdentity.name ? diagnosticData.push(buildPerformanceEvent('view-target-changed', event)): '');
        // view.on('shown', event => event.target.name === targetIdentity.name ? diagnosticData.push(buildPerformanceEvent('view-shown', event)): '');
        view.on('created', event => diagnosticData.push(buildPerformanceEvent('view-created', event)));
    });
}

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