class ViewHost {
    constructor(){
     if(! ViewHost.instance) {
       this._init();
       ViewHost.instance = this;
     }

     return ViewHost.instance;
    }

    onContextChange(handler) {
        const id = 'host-context-subscriber-' + Date.now() + Math.floor(Math.random() * 10000);
        this._contextSubscribers[id] = handler;
        this._log("Listening to host context changes. Id: " + id);
        return {
            dispose: ()=> {
                this._log("Removing host context change listener. Id: " + id);
                delete this._contextSubscribers[id];
            }
        }
    }

    onHostChange(handler) {
        const id = 'host-change-subscriber-' + Date.now() + Math.floor(Math.random() * 10000);
        this._onHostChangeSubscribers[id] = handler;
        this._log("Listening to host changes. Id: " + id);
        return {
            dispose: ()=> {
                this._log("Removing host change listener. Id: " + id);
                delete this._onHostChangeSubscribers[id];
            }
        }
    }

    onHostViewCountChange(handler) {
        const id = 'host-viewcount-subscriber-' + Date.now() + Math.floor(Math.random() * 10000);
        this._onHostViewCountSubscribers[id] = handler;
        this._log("Listening to host view count changes. Id: " + id);
        return {
            dispose: ()=> {
                this._log("Removing host view count change listener. Id: " + id);
                delete this._onHostViewCountSubscribers[id];
            }
        }
    }

    async getViewCount() {
        this._log("Get view count requested");
        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        let views = await win.getCurrentViews();
        return views.length;
    }

    async getCurrentId() {
        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        return win.identity.name;
    }

    async sendToViews(message, linkedHostId = null) {
        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        let from = view.me.name;
        let targetHostId;
        let isCurrentHost;

        if(linkedHostId === null) {
            targetHostId =  win.identity.name;
            isCurrentHost = true;
        } else {
            targetHostId = linkedHostId;
            isCurrentHost = linkedHostId ===  win.identity.name;
        }

        try {
            this._log("Trying to send message to views: from: " + from + " host id: " + targetHostId + " is current host: " + isCurrentHost);
            fin.InterApplicationBus.send({
                uuid: win.identity.uuid
            }, targetHostId + '/views',
            {
                from,
                message
            });
        } catch (error) {
            this._log("No other listeners for message from: " + from + " and targeting host: " + targetHostId);
        }
    }

    async listenToViews(handler, autoDisposeOnHostChange = true, linkedHostId = null) {
        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        let targetHostId;
        let isCurrentHost;

        if(linkedHostId === null) {
           targetHostId = win.identity.name;
           isCurrentHost = true;
        } else {
            targetHostId = linkedHostId;
            isCurrentHost = linkedHostId === win.identity.name;
        }
        let identity = {
            uuid: win.identity.uuid
        };
        let topic = targetHostId + '/views';
        const id = 'host-views-message-subscription-' + Date.now() + Math.floor(Math.random() * 10000);
        this._log("Listening to view messages: auto dispose on host change: " + autoDisposeOnHostChange + " host id: " + targetHostId + " is current host: " + isCurrentHost);
        fin.InterApplicationBus.subscribe(identity, topic, handler);
        this._onHostViewMessageSubscriptions[id] = {
            autoDisposeOnHostChange,
            dispose: ()=>{
                this._log("Unsubscribing from listening to view messages: auto dispose on host change: " + autoDisposeOnHostChange + " host id: " + targetHostId + " was current host: " + isCurrentHost);
                fin.InterApplicationBus.unsubscribe(identity, topic, handler);
            }
        };

        return {
            dispose: ()=> {
                if(this._onHostViewMessageSubscriptions[id] !== undefined) {
                    this._onHostViewMessageSubscriptions[id].dispose();
                }
            }
        };
    }

    async getContext() {
        this._log("Request to get host shared context.");
        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        let options = await win.getOptions();
        if(options.customData === undefined || options.customData === null || options.customData.hostContext === undefined) {
            return undefined;
        }

        return options.customData.hostContext;
    }

    async setContext(customContext) {
        this._log("Request to set host shared context.");
        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        await win.updateOptions({customData: {hostContext: customContext}});
    }

    async _init() {
        this._log("Init called.");
        this._contextSubscribers = {};
        this._onHostChangeSubscribers = {};
        this._onHostViewCountSubscribers = {};
        this._disposables = {};
        this._onHostViewMessageSubscriptions = {};

        const view = fin.View.getCurrentSync();

        await view.addListener("target-changed", async (event)=> {
            this._log("Host Changed");
            this._notifyHostChangeSubscribers(
                {
                    newHostName: event.target.name,
                    previousHostName: event.previousTarget === undefined ? undefined : event.previousTarget.name,
                    viewCount: await this.getViewCount()
                }
            );
            await this._listenToHostViewCountChange();
            await this._listenToHostContextChange();

            let subscriptions = Object.keys(this._onHostViewMessageSubscriptions);
            let disposablesToClear = [];

            subscriptions.forEach(subscriptionId => {
                let subscription = this._onHostViewMessageSubscriptions[subscriptionId];
                if(subscription.autoDisposeOnHostChange) {
                    this._log("Disposing of host view message subscription as the host has changed and autoDispose on host change was: " + subscription.autoDisposeOnHostChange);
                    subscription.dispose();
                    disposablesToClear.push(subscriptionId);
                }
            });

            disposablesToClear.forEach(disposableId => {
                delete this._onHostViewMessageSubscriptions[disposableId];
            });
        });

        await this._listenToHostViewCountChange();
        await this._listenToHostContextChange();

        await view.addListener("destroyed", ()=> {
            this._log("View destroyed.");
            this._contextSubscribers = {};
            this._onHostChangeSubscribers = {};
            this._onHostViewCountSubscribers = {};

            if(this._disposables.disposeViewCountListeners !== null && this._disposeables.disposeViewCountListeners !== undefined) {
                this._disposables.disposeViewCountListeners();
            }

            if(this._disposables.disposeHostContextListeners !== null && this._disposeables.disposeHostContextListeners !== undefined) {
                this._disposables.disposeHostContextListeners();
            }

            let subscriptions = Object.keys(this._onHostViewMessageSubscriptions);

            subscriptions.forEach(subscriptionId => {
                this._log("View Destruction: Clearing host view message subscription: " + subscriptionId);
                this._onHostViewMessageSubscriptions[subscriptionId].dispose();
            });

            this._onHostViewMessageSubscriptions = {};
        });
    }

    _notifyContextSubscribers(newContext) {
        this._log("Notifying context subscribers");
        let subscriberList = Object.keys(this._contextSubscribers);
        subscriberList.forEach(subscriberId => {
            this._contextSubscribers[subscriberId](newContext);
        });
    }

    _notifyHostChangeSubscribers(data) {
        this._log("Notifying host change subscribers");
        let subscriberList = Object.keys(this._onHostChangeSubscribers);
        subscriberList.forEach(subscriberId => {
            this._onHostChangeSubscribers[subscriberId](data);
        });
    }

    _notifyHostViewCountSubscribers(data) {
        this._log("Notifying host view count subscribers");
        let subscriberList = Object.keys(this._onHostViewCountSubscribers);
        subscriberList.forEach(subscriberId => {
            this._onHostViewCountSubscribers[subscriberId](data);
        });
    }

    async _listenToHostViewCountChange() {

        if(this._disposables.disposeViewCountListeners !== null && this._disposables.disposeViewCountListeners !== undefined) {
            this._log("Disposing of previous view count listeners.");
            this._disposables.disposeViewCountListeners();
        }

        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        win.on("view-attached", this._updateViewCount.bind(this));
        win.on("view-detached", this._updateViewCount.bind(this));
        this._disposables.disposeViewCountListeners = ()=> {
            win.removeListener("view-attached", this._updateViewCount.bind(this));
            win.removeListener("view-detached", this._updateViewCount.bind(this));
        };
    }

    async _listenToHostContextChange() {

        if(this._disposables.disposeHostContextListeners !== null && this._disposables.disposeHostContextListeners !== undefined) {
            this._log("Disposing of previous host context change listeners.");
            this._disposables.disposeHostContextListeners();
        }

        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        win.on('options-changed', this._updateHostContext.bind(this));
        this._disposables.disposeHostContextListeners = ()=> {
            win.removeListener('options-changed', this._updateHostContext.bind(this));
        };
    }

    async _updateViewCount(){
        this._notifyHostViewCountSubscribers({
            viewCount: await this.getViewCount()
        });
    }

    async _updateHostContext(event) {
        if (event.diff.customData && event.diff.customData) {
            this._notifyContextSubscribers(event.options.customData.hostContext);
        }
    }

    _log(message) {
        console.log("ViewHost: " + message);
    }
  }

  const instance = new ViewHost();
  Object.freeze(instance);


  export default instance;
