export const CONTAINER_ID = 'layout-container';
window.addEventListener('DOMContentLoaded', () => {
    // fin.me.showDeveloperTools().then(() => console.log('Showing dev tools')).catch(err => console.error(err));

    // Before .50 AI version this may throw...
    fin.Platform.Layout.init({containerId: CONTAINER_ID});

    // fin.me.interop = fin.Interop.connectSync(fin.me.uuid);
    fin.Window.getCurrentSync().addListener('view-shown', (evt) => {
        console.log('evt view shown', evt);
        fin.View.wrapSync(evt.viewIdentity).getOptions().then((opts) => {
            console.log('opts', opts)
            if (opts.interop && opts.interop.channelDeclaration) {
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.remove('red-channel', 'green-channel', 'pink-channel', 'orange-channel', 'purple-channel', 'yellow-channel');
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.add(`${opts.interop.channelDeclaration}-channel`);    
            }
        })
    });
    fin.Window.getCurrentSync().addListener('view-attached', (evt) => {
        console.log('evt view attached', evt);
        fin.View.wrapSync(evt.viewIdentity).getOptions().then((opts) => {
            console.log('opts', opts)
            if (opts.interop && opts.interop.channelDeclaration) {
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.remove('red-channel', 'green-channel', 'pink-channel', 'orange-channel', 'purple-channel', 'yellow-channel');
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.add(`${opts.interop.channelDeclaration}-channel`);    
            }
        })
    });
    // async function makeClient(channelName) {
    //     // A payload can be sent along with channel connection requests to help with authentication
    //     const connectPayload = {};

    //     // If the channel has been created this request will be sent to the provider.  If not, the
    //     // promise will not be resolved or rejected until the channel has been created.
    //     const clientBus = await fin.InterApplicationBus.Channel.connect(channelName, connectPayload);

    //     clientBus.onDisconnection(channelInfo => {
    //         // handle the channel lifecycle here - we can connect again which will return a promise
    //         // that will resolve if/when the channel is re-created.
    //         // makeClient(channelInfo.channelName);
    //         console.log(`Disconnected from the provider: ${channelInfo}`)
    //     })

    //     // clientBus.register('topic', (payload, identity) => {
    //     //     // register a callback for a topic to which the channel provider can dispatch an action
    //     //     console.log('Action dispatched by provider: ', JSON.stringify(identity));
    //     //     console.log('Payload sent in dispatch: ', JSON.stringify(payload));
    //     //     return {
    //     //         echo: payload
    //     //     };
    //     // });

    //     return clientBus;
    // }

    // makeClient('ColorChannelBroker')
    //     .then((client) => { 
    //         console.log('Connected to ColorChannel Broker')

    //         function changeColorChannel(target, color) {
    //             return client.dispatch('changeColorChannel', { target, color })
    //         }

    //         function getColorSnapshot() {
    //             return client.dispatch('getColorSnapshot')
    //         }

    //         function setColorSnapshot(colorChannelInfo) {
    //             return client.dispatch('setColorSnapshot', {colorChannelInfo})
    //         }

    //         window.colorChannelAPI = {
    //             changeColorChannel,
    //             getColorSnapshot,
    //             setColorSnapshot
    //         }
    //     })
    //     .catch(console.error);

});
