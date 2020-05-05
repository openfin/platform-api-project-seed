class HostViewContainer {
    constructor(){
     if(! HostViewContainer.instance) {
       this._init();
       HostViewContainer.instance = this;
     }

     return HostViewContainer.instance;
    }

    getAllOptions() {
        return JSON.parse(JSON.stringify(this._viewContainerOptions));
    }

    updateAllOptions(allOptions){

        if(this._pendingAction.updateAll !== null) {
            clearTimeout(this._pendingAction.updateAll);
            this._pendingAction.updateAll = null;
        }
        this._pendingAction.updateAll = setTimeout(()=> {
            // before apply this give the DOM some space to be rebuilt in case it is a case of layout replace being used (we don't want to apply the change to the layout that is about to be replaced).
            let keys = Object.keys(allOptions);

            keys.forEach(key => {
                this.updateOptions(allOptions[key]);
            });
        }, 100);
    }

    updateOptions(options) {

        if(options === undefined) {
            return;
        }

        let id;

        if(options.viewId !== undefined) {
            id = 'tab-' + options.viewId;
        } else {
            this._log("A viewId was not passed so we cannot apply options to a view container");
            return;
        }

        let containerOptions = this._viewContainerOptions[options.viewId];

        if(containerOptions === undefined) {
            containerOptions = {};
        }

        let keys = Object.keys(options);

        keys.forEach(key => {
            containerOptions[key] = options[key];
        });

        this._viewContainerOptions[options.viewId] = containerOptions;

        let tab = document.getElementById(id);

        if(tab !== undefined && tab !== null){

            if (options.canMove === true || options.canMove === false) {
                if(options.canMove) {
                    tab.style.cursor = null;
                    tab.classList.remove('move-disabled');
                } else {
                    tab.style.cursor = 'default';
                    tab.classList.add('move-disabled');
                }
                tab.draggable = options.canMove;
            }

            if (options.canClose === true) {
                tab.classList.remove('close-disabled');
            } else if(options.canClose === false) {
                tab.classList.add('close-disabled');
            }
        }
    }

    _init() {
        this._log("Init called.");
        this._viewContainerOptions = {};
        this._pendingAction = {
            updateAll: null
        };

        fin.InterApplicationBus.subscribe({ uuid: fin.me.identity.uuid},fin.me.identity.name + '-view-container-options', options => {
            this.updateOptions(options);
        }).then(() => this._log('Listening for host view container options')).catch(err => this._log(err));

        const finWindow = fin.Window.getCurrentSync();

        finWindow.on("view-detached", function(event) {
            if(this._viewContainerOptions !== undefined &&
                event !== undefined &&
                event.viewIdentity !== undefined &&
                event.viewIdentity.name !== undefined) {
                delete this._viewContainerOptions[event.viewIdentity.name];
            }
        });

        // document.body.addEventListener("drop", ()=> {
        //     this.updateAllOptions(this.getAllOptions());
        // });

        const myLayoutContainer = document.getElementById('layout-container');
        myLayoutContainer.addEventListener('tab-created', async (event)=> {
            console.log("Tab created");
            this.updateAllOptions(this.getAllOptions());
        });
    }

    _log(message) {
        console.log("HostViewContainer: " + message);
    }
  }

  const instance = new HostViewContainer();
  Object.freeze(instance);


  export default instance;
