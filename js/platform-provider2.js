fin.Platform.init({
    // interopOverride: async (InteropBroker, provider, options, ...args) => {
    //     class Override extends InteropBroker {
    //         constructor(provider, options, ...args) {
    //             super(provider, options, ...args);
    //             this.externalBrokers = ['platform_customization_local-1'];
    //             this.externalClients = new Map();
    //             this.initializeBrokers();
    //         }

    //         async initializeBrokers() {
    //             this.externalBrokers.forEach(async (brokerUuid) => {
    //                 const tempClient = fin.Interop.connectSync(brokerUuid);
    //                 const app = fin.Application.wrapSync({ uuid: brokerUuid });
        
    //                 if (tempClient.isRunning) {
    //                     await this.setupContextGroups(tempClient, brokerUuid);
    //                 }
                    
    //                 app.on('broker-is-ready', async (e) => {
    //                     await this.setupContextGroups(tempClient, brokerUuid);
    //                 });
            
    //                 app.once('closed', () => {
    //                     externalClients.delete(brokerUuid);
    //                 });
    //             });
    //         }

    //         async setupContextGroups(client, brokerUuid) {
    //             const contextGroups = await client.getContextGroups();
    //             const colorClientsMap = new Map();
    
    //             contextGroups.forEach(async (ctxGrpInfo) => {
    //                 const colorClient = fin.Interop.connectSync(brokerUuid);
    //                 await colorClient.joinContextGroup(ctxGrpInfo.id);

    //                 await colorClient.addContextHandler(async (context) => {
    //                     const tempClient = fin.Interop.connectSync(fin.me.uuid);
    //                     await tempClient.joinContextGroup(ctxGrpInfo.id);
    //                     tempClient.setContext(context);
    //                 });

    //                 colorClientsMap.set(ctxGrpInfo.id, colorClient);
    //             });
    
    //             this.externalClients.set(brokerUuid, colorClientsMap);
    //         }

    //         async setContext(payload, clientIdentity) {
    //             const { context } = payload;

    //             if (this.externalClients.size > 0) {
    //                 const state = this.getClientState(clientIdentity);
                    
    //                 this.externalClients.forEach((colorClientsMap) => {
    //                     if (colorClientsMap.has(state.contextGroupId)) {
    //                         const colorClient = colorClientsMap.get(state.contextGroupId);
    //                         colorClient.setContext(context);
    //                     }
    //                 });
    //             }

    //             super.setContext(payload, clientIdentity);
    //         }
    //     }

    //     return new Override(provider, options, ...args);
    // }
});

// fin.me.showDeveloperTools().then(() => console.log('Showing dev tools')).catch(err => console.error(err));