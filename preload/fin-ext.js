console.log('Loading JS Adapter Extensions...');

(function() {
    fin.Service = {
        create: async function(name, instance) {
            const channel = await fin.InterApplicationBus.Channel.create(name);
            channel.setDefaultAction(async (action, args, caller) => {
                const getContextFunc = fin.Service.getContext;
                fin.Service.getCallingContext = function() { return caller; };
                const result = await instance[action](...args);
                fin.Service.getCallingContext = getContextFunc;
                return result;
            });
        },
        connect: async function(name) {
            const channel = await fin.InterApplicationBus.Channel.connect(name);
        
            return Promise.resolve(new Proxy({ }, {
                get: function(_, prop) {
                    if(prop === "then") {
                        return undefined;
                    }
                    return async function(...args) {
                        return await channel.dispatch(prop, [...args]);
                    };
                }
            }));
        },
        getCallingContext: function() {
            return fin.me.identity;
        }
    };


    function upgradeOptions(opts) {
        console.log('createProjectedOptions');
        const { customData } = opts;

        if(customData && customData._ext) {
            opts.channelId = customData._ext.channelId;
            delete customData._ext;
        } else {
            opts.channelId = '';
        }

        return opts;
    }

    function downgradeOptions(opts, currentOpts = {}) {
        const { customData, channelId } = opts;
        const currentCustomData = currentOpts.customData;

        if(channelId !== undefined) {
            if(currentCustomData !== undefined && customData === undefined) {
                opts.customData = currentCustomData;
            }

            if(customData === undefined) {
                opts.customData = {};
            }

            Object.assign(opts.customData, { _ext: { channelId }});

            delete opts.channelId;
        }

        return opts;
    }

    function applyIntoWindows(wins, callbackFn) {
        return !Array.isArray(wins) ?
            wins :
            wins.map(win => {
                win = callbackFn(win);
                if(win.layout) {
                    win.layout.content = applyIntoContent(win.layout.content, callbackFn);
                }
                return win;
            });
    }

    function applyIntoContent(content, callbackFn) {
        return !Array.isArray(content) ?
            content :
            content.map(contentItem => {
                if(contentItem.type === 'component' && contentItem.componentName === 'view') {
                    contentItem.componentState = callbackFn(contentItem.componentState);
                }
                applyIntoContent(contentItem.content, callbackFn);
                return contentItem;
            });
    }

    function extendWindwoOrView(win) {
        const getOptions = win.getOptions;

        win.getOptions = async function() {
            console.log('Window.getOptions ext');
            let opts = await getOptions.call(win);

            return upgradeOptions(opts);
        }

        const updateOptions = win.updateOptions;
        win.updateOptions = async function(opts) {
            console.log('Window.updateOptions ext');
            let currentOpts = await getOptions.call(win);
            updateOptions.call(win, downgradeOptions(opts, currentOpts));
        }

        return win;
    }

    function extendApplication(app) {
        const getChildWindows = app.getChildWindows;

        app.getChildWindows = async function() {
            let childWindows = await getChildWindows.call(app);
            return childWindows.map(extendWindwoOrView);
        }

        return app;
    }

    const finWindowGetCurrentSync = fin.Window.getCurrentSync;
    fin.Window.getCurrentSync = function() {        
        let win = finWindowGetCurrentSync.call(fin.Window);
        return extendWindwoOrView(win);
    }

    const finWindowCreate = fin.Window.create;
    fin.Window.create = async function(opts) {
        let win = await finWindowCreate.call(fin.Window, downgradeOptions(opts));
        return extendWindwoOrView(win);
    }

    const finViewGetCurrentSync = fin.View.getCurrentSync;
    fin.View.getCurrentSync = function() {        
        let view = finViewGetCurrentSync.call(fin.View);
        return extendWindwoOrView(view);
    }

    const finViewCreate = fin.View.create;
    fin.View.create = async function(opts) {
        let view = await finViewCreate.call(fin.View, opts);
        return extendWindwoOrView(view);
    }

    const finApplicationGetCurrentSync = fin.Application.getCurrentSync;
    fin.Application.getCurrentSync = function() {
        let app = finApplicationGetCurrentSync.call(fin.Application);
        return extendApplication(app);
    }

    switch (fin.me.entityType) {
        case 'window':
            fin.me = fin.Window.getCurrentSync();
            fin.me.isWindow = true;
            Object.assign(fin.me, fin.me.identity);
            break;
        case 'view':
            fin.me = fin.View.getCurrentSync();
            fin.me.isView = true;
            Object.assign(fin.me, fin.me.identity);
            break;
    }

    const upgradeChangedOptions = (evt) => {
        evt.options = upgradeOptions(evt.options);
    }

    fin.Application.getCurrentSync().addListener('view-options-changed', upgradeChangedOptions);
    fin.Application.getCurrentSync().addListener('window-options-changed', upgradeChangedOptions);
    fin.me.addListener('options-changed', upgradeChangedOptions);

    fin.Extensions = {
        upgradeOptions,
        downgradeOptions,
        applyIntoContent,
        applyIntoWindows
    }
})();
