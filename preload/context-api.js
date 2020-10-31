class DistributedStore {
    constructor(name, opts = {}) {
        const controlTopic = `store/control/${name}`;
        const dataTopic = `store/data/${name}`;
        const scope = opts.scope || { uuid: '*' };
        const instanceId = fin.desktop.getUuid();

        let rev = 0;
        this.value = opts.initialValue;
        this.instanceId = instanceId;

        const onDataReceived = ({ data, revision, sender }) => {
            if(sender === instanceId) {
                return;
            }

            if(revision >= rev) {
                this.value = data;
                rev = revision;
            } else {
                publishData();
            }
        };

        const onControlMessageReceived = () => {
            publishData();
        };

        const publishData = () => {
            fin.InterApplicationBus.publish(dataTopic, {
                data: this.value,
                revision: rev,
                sender: instanceId
            });
        }

        this.init = async () => {
            await fin.InterApplicationBus.subscribe(scope, dataTopic, onDataReceived);

            let dataReceivedOnce = new Promise(resolve => {
                let onceDataReceived = async () => {
                    fin.InterApplicationBus.unsubscribe(scope, dataTopic, onceDataReceived);
                    resolve();
                };
                return fin.InterApplicationBus.subscribe(scope, dataTopic, onceDataReceived)
            });

            let createdNew;
            await fin.InterApplicationBus.send(scope, controlTopic, true)
                .then(() => createdNew = false)
                .catch(() => createdNew = true);

            if(createdNew) {
                rev = Date.now();
            } else {
                await dataReceivedOnce;
            }

            await fin.InterApplicationBus.subscribe(scope, controlTopic, onControlMessageReceived);
            
            delete this.init;
        };

        this.set = (value) => {
            this.value = value;
            rev = Date.now();
            publishData();
        };

        this.get = () => {
            return this.value;
        }
    }
}

fin.InterApplicationBus.Context = {
    open: async function(name, opts) {
        const store = new DistributedStore(name, opts);
        await store.init();
        return store;
    }
};