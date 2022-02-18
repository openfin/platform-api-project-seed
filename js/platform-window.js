export const CONTAINER_ID = 'layout-container';
window.addEventListener('DOMContentLoaded', async () => {
    const preventedViews = [];
    const notPreventedViews = [];
    const beforeUnloadDialog = fin.Window.wrapSync({ name: 'before-unload-dialog', uuid: fin.me.identity.uuid });

    beforeUnloadDialog.on('closed', () => {
        unloadedViews.clear();
    });

    fin.me.on('close-requested', async (event) => {
        const viewsToDestroy = await fin.me.getCurrentViews();
        viewsToDestroy.forEach(view => {
            view.triggerBeforeUnload();
        });
    });

    const finishedGoingThroughViews = async () => {
        const views = await fin.me.getCurrentViews();
        const viewNamesArr = views.map(view => view.name);
        const processedViews = [...preventedViews, ...notPreventedViews];
        return checker(viewNamesArr, processedViews) && preventedViews.length > 0;
    }

    const checker = (arr, target) => target.every(v => arr.includes(v));

    fin.me.on('view-before-unload-not-needed', async (event) => {
        console.log('UNLOAD NOT NEEDED');
        console.log(event);
        notPreventedViews.push(event.viewIdentity.name);

        if (await finishedGoingThroughViews()) {
            const winIdString = JSON.stringify(fin.me.identity);
            const queryString = new URLSearchParams(`winId=${winIdString}`);
            const baseUrl = window.location.href.replace('platform-window', 'before-unload-dialog');
            const url = `${baseUrl}?${queryString.toString()}`;
            await fin.Window.create({ name: 'before-unload-dialog', url });
        }
        
    });

    fin.me.on('view-will-prevent-unload', async (event) => {
        console.log('UNLOAD PREVENTED');
        console.log(event);
        preventedViews.push(event.viewIdentity.name);

        if (await finishedGoingThroughViews()) {
            const winIdString = JSON.stringify(fin.me.identity);
            const queryString = new URLSearchParams(`winId=${winIdString}`);
            const baseUrl = window.location.href.replace('platform-window', 'before-unload-dialog');
            const url = `${baseUrl}?${queryString.toString()}`;
            await fin.Window.create({ name: 'before-unload-dialog', url });
        }
    });

    // Before .50 AI version this may throw...
    await fin.Platform.Layout.init({ containerId: CONTAINER_ID });
});
