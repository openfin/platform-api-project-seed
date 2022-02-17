export const CONTAINER_ID = 'layout-container';
window.addEventListener('DOMContentLoaded', async () => {
    const unloadedViews = new Map();
    const beforeUnloadDialog = fin.Window.wrapSync({ name: 'before-unload-dialog', uuid: fin.me.identity.uuid });

    beforeUnloadDialog.on('closed', () => {
        unloadedViews.clear();
    });

    fin.me.on('view-unload-prevented', async (event) => {
        const { uuid, name } = event.viewIdentity;
        const view = fin.View.wrapSync(event.viewIdentity);
        unloadedViews.set(`${uuid}-${name}`, view);
        const winIdString = JSON.stringify(fin.me.identity);
        console.log(winIdString);
        const queryString = new URLSearchParams(`winId=${winIdString}`);
        const baseUrl = window.location.href.replace('platform-window', 'before-unload-dialog');
        const url = `${baseUrl}?${queryString.toString()}`;
        await fin.Window.create({ name: 'before-unload-dialog', url });
    });

    // Before .50 AI version this may throw...
    await fin.Platform.Layout.init({ containerId: CONTAINER_ID });
});
