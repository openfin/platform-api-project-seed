import { createNativeProvider } from './platform-native.js';

fin.Platform.init({
    overrideCallback: async (ProviderBase) => {
        const NativeProviderBase = createNativeProvider(ProviderBase);

        class CustomProvider extends NativeProviderBase {
            // Additional Overrides Go Here
        }

        return new CustomProvider();
    },

    _overrideCallback: async (ProviderBase) => {

        const systemChannels = await Promise.all([
            'red', 'yellow', 'orange', 'yellow', 'green', 'blue', 'purple' 
        ].map(async (id) => ({
            id,
            type: 'system',
            context: await fin.InterApplicationBus.Store.open(`fdc3/channel/system/${id}`, null) 
        })));

        const appChannels = [ ];

        
        class Provider extends createNativeProvider(ProviderBase) {
            async getSnapshot() {
                let snapshot = await super.getSnapshot();
                Object.assign(snapshot, { 
                    channels: systemChannels.map(({id, type, context}) => ({id, type, context: context.get()}))
                });

                return snapshot;
            }

            async applySnapshot({ snapshot }) {
                // HACK: View creation from snaphot apply is not being intercepted correctly
                // and needs manual tweaking beforehand
                snapshot.windows = fin.Extensions.applyIntoWindows(snapshot.windows, fin.Extensions.downgradeOptions);
                // ------------------------------------

                return await super.applySnapshot({ snapshot });
            }

            async createView(...args) {
                return await super.createView(...args);
            }
        };
        
        return new Provider();
    }
});

(async function() {

    class DesktopAgent {
        open(name, context = undefined) { }

        broadcast(context) { }
        addContextListener(contextType = undefined, handler) { }

        findIntents(intent, context = undefined) { }
        findIntentsByContext(context) { }
        raiseIntent(intent, context, target = undefined) { }
        addIntentListener(intent, handler) { }

        getOrCreateChannel(channelId) { }
        getSystemChannels() { }
        joinChannel(channelId) { }
        getCurrentChannel() { }
        leaveCurrentChannel() { }
    }
})();