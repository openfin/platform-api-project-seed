// // fin.me.showDeveloperTools().then(() => console.log('Showing dev tools')).catch(err => console.error(err));

// window.interopAPI = null; 

// fin.me.getOptions()
//     .then(opts => {
//         console.log(opts)
//         async function makeClient(channelName) {
//             // A payload can be sent along with channel connection requests to help with authentication
//             const connectPayload = { payload: {
//                 intentDeclaration: opts.intentDeclaration,
//                 contextDeclaration: opts.contextDeclaration,
//                 colorChannelDeclaration: opts.customData && opts.customData.colorChannelDeclaration
//             } };

//             // If the channel has been created this request will be sent to the provider.  If not, the
//             // promise will not be resolved or rejected until the channel has been created.
//             const clientBus = await fin.InterApplicationBus.Channel.connect(channelName, connectPayload);

//             clientBus.onDisconnection(channelInfo => {
//                 // handle the channel lifecycle here - we can connect again which will return a promise
//                 // that will resolve if/when the channel is re-created.
//                 // makeClient(channelInfo.channelName);
//                 console.log(`Disconnected from the provider: ${channelInfo}`)
//             })

//             clientBus.register('topic', (payload, identity) => {
//                 // register a callback for a topic to which the channel provider can dispatch an action
//                 console.log('Action dispatched by provider: ', JSON.stringify(identity));
//                 console.log('Payload sent in dispatch: ', JSON.stringify(payload));
//                 return {
//                     echo: payload
//                 };
//             });

//             return clientBus;
//         }

//         return makeClient('InteropBroker')
//             .then((client) => {
//                 console.log('Connected to Interop Broker')
                
//                 // At first thought that options could have color channel, but maybe it's implied and handled in the provider
//                 // Actually maybe we can control dynamic channels from the window, not from the view. That way you only have to implement FDC3 stuff and this handles the colors for you
//                 function raiseIntent(intentString, contextType, contextPayload, target) {
//                     return client.dispatch('raiseIntent', {intentString, contextType, contextPayload, target})
//                 }

//                 // At first thought that options could have color channel, but maybe it's implied and handled in the provider
//                 // Actually maybe we can control dynamic channels from the window, not from the view. That way you only have to implement FDC3 stuff and this handles the colors for you
//                 function setContext(contextType, contextPayload) {
//                     return client.dispatch('setContext', {contextType, contextPayload})
//                 }

//                 async function receiveContext(listener) {
//                     console.log('receiveContext set', listener)
//                     await client.register('receiveContext', listener)
//                     client.dispatch('receiveContext')
//                 }

//                 window.interopAPI = {
//                     raiseIntent,
//                     setContext,
//                     receiveContext
//                 };
//             })
//             .catch(console.error);
//     })
//     .catch(err => console.log(err));

    