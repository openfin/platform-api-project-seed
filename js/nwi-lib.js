const clientMap = new Map();

export class NWIClient {

    constructor(provider) {
        //TODO: terrible name.
        this.provider = provider;
    }

    //TODO: shit name.
    async getClient(provider) {
        const target = provider || this.provider;        
        if (!clientMap.has(target)) {
            const clientPromise = this.connect(target);
            clientMap.set(target, clientPromise);
        }
        return clientMap.get(target);
    }

    async connect() {
        try {
            this._client = await fin.InterApplicationBus.Channel.connect(this.provider);
            this._client.onDisconnection(() => {
                clientMap.delete(this.provider);
            });
            return this._client;
        } catch (e) {
            clientMap.delete(this.provider);
            throw e;
            // throw new Error(
            //     //'The targeted Platform is not currently running. Listen for application-started event for the given Uuid.'
            //     //DO something smart here.
            //     console.error(e)
            // );
        }
    }

    async getSnapshotFragment(configurations) {
        const client = await this.getClient();
        return client.dispatch("get:snapshot:fragment", configurations);
    }

    async applySnapshotFragment(snapshotFragement) {
        const client = await this.getClient();
        return await client.dispatch("apply:snapshot:fragment", snapshotFragement);
    }

}

 //Channel disconnect errors be like:
 //"The client you are trying to dispatch from is disconnected from the target provider"