export function createNativeProvider(ProviderBase) {
    const channelName = `${fin.me.identity.uuid}/native-platform-provider`;
    const providerChannelP = fin.InterApplicationBus.Channel.create(channelName);

    const nativeApps = new Map();
    const nativeWindows = new Map();

    const convertOptions = function(opts) {
        let result = Object.assign({}, {...opts});
        if(opts.name === undefined) {
            Object.assign(result, { name: `internally-generated-native-window/${fin.desktop.getUuid()}`});
        }
        return result;
    }

    return class NativeProvider extends ProviderBase {
        constructor(...args) {
            super(...args);
            providerChannelP.then(ch => ch.register('register-window', opts => this.registerWindow(opts)));
            providerChannelP.then(ch => ch.register('custom-data-changed', evt => this.onCustomDataChanged(evt)));
        }

        async createView({ opts, target }, caller) {
            if(opts.startInfo) {
                //TODO: refactor and consolidate with createWindow
                let { startInfo, name, className, mainWindow, customData } = opts;
                let { uuid } = startInfo;

                let client;
                try {
                    client = await fin.InterApplicationBus.Channel.connect(uuid, { wait: false });
                } catch {
                    let process = await fin.System.launchExternalProcess(startInfo);
                    uuid = process.uuid;
                    
                    client = await fin.InterApplicationBus.Channel.connect(uuid, { wait: true });
                    await client.dispatch('register-provider', { channelName });
                    nativeApps.set(uuid, { startInfo });
                }

                let childId = await client.dispatch('create-window', opts);
                let nativeChild = await fin.ExternalWindow.wrap({ nativeId: childId });

                let result = await super.createView({ opts: { url: 'about:blank' }, target }, caller);
                let view = fin.View.wrapSync(result.identity);

                view.addListener('hidden', () => nativeChild.hide());
                view.addListener('shown', async () => {
                    await nativeChild.setBounds(await view.getBounds());
                    await nativeChild.show();
                    await nativeChild.bringToFront();
                });

                let viewWindow = await view.getCurrentWindow();
                let parentId = await viewWindow.getNativeId();

                await client.dispatch('embed-window', { parentId, childId });

                await client.disconnect();
                return view;
            } else {
                return super.createView({ opts, target }, caller);
            }
        }

        async createWindow(opts, caller) {
            if(opts.startInfo) {
                let { startInfo, name, className, mainWindow, customData } = opts;
                let { uuid } = startInfo;

                let client;
                try {
                    client = await fin.InterApplicationBus.Channel.connect(uuid, { wait: false });
                } catch {
                    let process = await fin.System.launchExternalProcess(startInfo);
                    uuid = process.uuid;
                    
                    client = await fin.InterApplicationBus.Channel.connect(uuid, { wait: true });
                    await client.dispatch('register-provider', { channelName });
                    nativeApps.set(uuid, { startInfo });
                }

                let nativeId = await client.dispatch('create-window', opts);
                await this.registerWindow({ nativeId, uuid, name, className, mainWindow, customData });
                await client.disconnect();
            } else {
                return super.createWindow(opts, caller);
            }
        }

        async registerWindow(opts) {
            let { uuid, name, className, mainWindow, nativeId, customData } = convertOptions(opts);
            let externalWindow = await fin.ExternalWindow.wrap({ nativeId });
            nativeWindows.set(name, Object.assign(externalWindow, { uuid, name, className, mainWindow, customData })); // externalWindow.identity is broken / unusable
            externalWindow.addListener('closed', () => nativeWindows.delete(name));
            return { uuid, name };
        }

        async onCustomDataChanged(evt) {
            let { name, customData } = evt;
            let nativeWindow = nativeWindows.get(name);

            if(nativeWindow) {
                Object.assign(nativeWindow, { customData });
            }
        }

        async getSnapshot() {
            let snapshot = await super.getSnapshot();

            let nativeEntries = await Promise.all([...nativeWindows.entries()].map(async ([name, externalWindow]) => {
                let bounds = await externalWindow.getBounds();
                let { startInfo } = nativeApps.get(externalWindow.uuid);
                let { className, mainWindow, customData } = externalWindow;

                let result = {
                    name,
                    className,
                    mainWindow,
                    customData,
                    startInfo,
                    defaultTop: bounds.top,
                    defaultLeft: bounds.left,
                    defaultHeight: bounds.height,
                    defaultWidth: bounds.width
                };

                return result;
            }));

            snapshot.windows = [
                ...snapshot.windows,
                ...nativeEntries
            ];

            return snapshot;
        }

        async applySnapshot({ snapshot, options }) {
            let nativeEntries = snapshot.windows.filter(win => win.startInfo);
            snapshot.windows = snapshot.windows.filter(win => win.startInfo === undefined);

            await super.applySnapshot({ snapshot, options});

            let { closeExistingWindows } = options || {};
            //let windowsToClose = closeExistingWindows ? new Map(nativeWindows) : new Map();

            if(closeExistingWindows) {
                await Promise.all([...nativeWindows.values()].map(async (entry) => {
                    await entry.close();
                }));
                nativeWindows.clear();
            }

            await Promise.all(nativeEntries.map(async (entry) => {
                let nativeWindow = nativeWindows.get(entry.name);
                //windowsToClose.delete(entry.name);

                if(nativeWindow === undefined) {
                    await this.createWindow(convertOptions(entry));
                } else {
                    await nativeWindow.setBounds({
                        top: entry.defaultTop,
                        left: entry.defaultLeft,
                        height: entry.defaultHeight,
                        width: entry.defaultWidth
                    });
                }
            }));

            // await Promise.all([...windowsToClose.values()].map(async (entry) => {
            //     await entry.close();
            // }));
        }
    }
}