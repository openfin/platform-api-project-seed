const launchDialog = async (viewsPreventingUnload, windowId) => {
    return new Promise(async (resolve, reject) => {
        fin.InterApplicationBus.subscribe({ uuid: '*' }, 'user-decision', resolve).catch(reject);

        const views = { views: viewsPreventingUnload };
        const queryString = new URLSearchParams(`views=${JSON.stringify(views)}`);
        const baseUrl = window.location.href.replace('provider', 'before-unload-dialog');
        console.log('baseUrl', baseUrl);
        const url = `${baseUrl}?${queryString.toString()}`;
        await fin.Window.create({ 
            name: 'before-unload-dialog', 
            url, 
            modalParentIdentity: windowId, 
            frame: false, 
            defaultHeight: 200, 
            defaultWidth: 400, 
            saveWindowState: false 
        });
    })
}

const overrideCallback = async (PlatformProvider) => {
    class MyOverride extends PlatformProvider {
        async getUserDecisionForBeforeUnload(payload) {
            console.log('getUserDecisionForBeforeUnload override', payload);
            const { windowClose, viewsPreventingUnload, viewsNotPreventingUnload, windowId } = payload;

            const continueWithClose = await launchDialog(viewsPreventingUnload, windowId);

            if (continueWithClose) {
                return { windowShouldClose: windowClose, viewsToClose: [...viewsNotPreventingUnload, ...viewsPreventingUnload] };
            } else {
                return { windowShouldClose: false, viewsToClose: [] };
            }
        }

        async closeWindow(payload, callerIdentity) {
            console.log('the window will close');
            super.closeWindow(payload, callerIdentity);
        }

    }
    return new MyOverride();
};

fin.Platform.init({ overrideCallback });