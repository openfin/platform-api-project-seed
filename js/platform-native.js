export function createNativeProvider(ProviderBase) {
    const channelName = `${fin.me.identity.uuid}/native-platform-provider`;
    const providerChannelP = fin.InterApplicationBus.Channel.create(channelName);

    const nativeApps = new Map();
    const nativeWindows = new Map();
    const embeddedWindows = new Map();

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
            providerChannelP.then(ch => ch.register('title-changed', evt => this.onTitleChanged(evt)));
        }

        async createView({ opts, target }, caller) {
            if(opts.startInfo) {
                let result = await super.createView({ opts: convertOptions({ ...opts, url: 'about:blank' }), target }, caller);
                let view = fin.View.wrapSync(result.identity);
                await this.embedIntoView(opts, view);
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

        async embedIntoView(opts, view) {
            //TODO: refactor and consolidate with createWindow
            let { startInfo, className, mainWindow, customData } = opts;
            let { uuid } = startInfo;
            let { name } = view.identity;

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

            let childId = await client.dispatch('create-window', Object.assign(opts, { frame: false, name }));
            let nativeChild = await fin.ExternalWindow.wrap({ nativeId: childId });

            let onShown, onTargetChanged;

            view.addListener('destroyed', () => nativeChild.close());
            view.addListener('hidden', () => nativeChild.hide());
            view.addListener('shown', onShown = async () => {
                await nativeChild.setBounds(await view.getBounds());
                await nativeChild.show();
                await nativeChild.bringToFront();
            });
            view.addListener('target-changed', onTargetChanged = async () => {
                console.log('target-changed');
                let viewWindow = await view.getCurrentWindow();
                let parentId = await viewWindow.getNativeId();
                await client.dispatch('embed-window', { parentId, childId });
            });

            await this.registerEmbeddedWindow({ uuid, name, className, mainWindow, externalWindow: nativeChild, customData });
            await onTargetChanged();
            await onShown();
            await client.disconnect();
        }

        async registerWindow(opts) {
            let { uuid, name, className, mainWindow, nativeId, customData } = convertOptions(opts);
            let externalWindow = await fin.ExternalWindow.wrap({ nativeId });
            nativeWindows.set(name, Object.assign(externalWindow, { uuid, name, className, mainWindow, customData })); // externalWindow.identity is broken / unusable
            externalWindow.addListener('closed', () => nativeWindows.delete(name));
            return { uuid, name };
        }

        async registerEmbeddedWindow(opts) {
            let { uuid, name, className, mainWindow, externalWindow, customData } = convertOptions(opts);
            embeddedWindows.set(name, Object.assign(externalWindow, { uuid, name, className, mainWindow, customData })); // externalWindow.identity is broken / unusable
            externalWindow.addListener('closed', () => embeddedWindows.delete(name));
            return { uuid, name };
        }

        async onCustomDataChanged(evt) {
            let { name, customData } = evt;
            
            let nativeWindow = nativeWindows.get(name);
            if(nativeWindow) {
                Object.assign(nativeWindow, { customData });
            }

            let embeddedWindow = embeddedWindows.get(name);
            if(embeddedWindow) {
                Object.assign(embeddedWindow, { customData });
            }
        }

        async onTitleChanged(evt) {
            let { name, title } = evt;
            let view = fin.View.wrapSync({ ...fin.me.identity, name });

            await view.executeJavaScript(`document.title = '${title}'`);
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

            snapshot.windows.forEach(win => {
                if(win.layout) {
                    win.layout.content.forEach(contentItem => this.updateContentItem(contentItem));
                }
            })

            snapshot.windows = [
                ...snapshot.windows,
                ...nativeEntries
            ];

            return snapshot;
        }

        updateContentItem(contentItem) {
            let { type, componentName, componentState, content } = contentItem;

            if(type === 'component' && componentName === 'view') {
                let { name } = componentState;

                let embeddedWindow = embeddedWindows.get(name);
                if(embeddedWindow) {
                    Object.assign(componentState, embeddedWindow);
                }
            }

            if(content) {
                content.forEach(contentItem => this.updateContentItem(contentItem));
            }
        }

        async embedContent(contentItem) {
            let { type, componentName, componentState, content } = contentItem;

            if(type === 'component' && componentName === 'view') {
                let { name, startInfo } = componentState;

                if(startInfo) {
                    let view = fin.View.wrapSync({ ...fin.me.identity, name });
                    await this.embedIntoView(componentState, view);
                }
            }

            if(content) {
                await Promise.all(content.map(contentItem => this.embedContent(contentItem)));
            }
        }

        async applySnapshot({ snapshot, options }) {
            let nativeEntries = snapshot.windows.filter(win => win.startInfo);
            snapshot.windows = snapshot.windows.filter(win => win.startInfo === undefined);
            
            let { closeExistingWindows } = options || {};
            
            if(closeExistingWindows) {
                await Promise.all([...nativeWindows.values()].map(async (entry) => {
                    await entry.close();
                }));
                nativeWindows.clear();
            }

            await super.applySnapshot({ snapshot, options});
            
            await Promise.all(nativeEntries.map(async (entry) => {
                let nativeWindow = nativeWindows.get(entry.name);

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

            await Promise.all(snapshot.windows.map(async (win) => {
                if(win.layout) {
                    return Promise.all(win.layout.content.map(contentItem => this.embedContent(contentItem)));
                }
            }));
        }
    }
}