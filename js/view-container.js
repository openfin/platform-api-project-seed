class ViewContainer {
    constructor(){
     if(! ViewContainer.instance) {
       this._init();
       ViewContainer.instance = this;
     }

     return ViewContainer.instance;
    }

    getOptions() {
        return this._options;
    }

    async updateOptions(options) {
        let view = fin.View.getCurrentSync();
        let win = await view.getCurrentWindow();
        let identity = win.identity;

        let keys = Object.keys(options);

        keys.forEach(key => {
            this._options[key] = options[key];
        });

        options.viewId = fin.me.identity.name;

        fin.InterApplicationBus.send(
            identity,
            identity.name + '-view-container-options',
            options
          )
            .then(() => this._log("View Container Options sent."))
            .catch(err => this._log(err));
    }

    onViewContainerChange(handler) {
        const id = 'view-container-change-subscriber-' + Date.now() + Math.floor(Math.random() * 10000);
        this._onViewContainerChangeSubscribers[id] = handler;
        this._log("Listening to view container changes. Id: " + id);
        return {
            dispose: ()=> {
                this._log("Removing view container change listener. Id: " + id);
                delete this._onViewContainerChangeSubscribers[id];
            }
        }
    }

    async _init() {
        this._log("Init called.");
        this._onViewContainerChangeSubscribers = {};
        this._disposables = {};
        this._options = {};

        const view = fin.View.getCurrentSync();

        await view.addListener("target-changed", async (event)=> {
            this._log("View Container Changed");
            this._notifyViewContainerChangeSubscribers();
        });

        await view.addListener("destroyed", ()=> {
            this._log("View destroyed.");
            this._onViewContainerChangeSubscribers = {};
        });
    }

    _notifyViewContainerChangeSubscribers() {
        this._log("Notifying view container change subscribers");
        let subscriberList = Object.keys(this._onViewContainerChangeSubscribers);
        subscriberList.forEach(subscriberId => {
            this._onViewContainerChangeSubscribers[subscriberId]();
        });
    }

    _log(message) {
        console.log("ViewContainer: " + message);
    }
  }

  const instance = new ViewContainer();
  Object.freeze(instance);


  export default instance;
