export const CONTAINER_ID = 'layout-container';

window.addEventListener('DOMContentLoaded', async () => {
    // let willPreventUnload = [];
    // let beforeUnloadFired = []
    // let currentViews = await fin.me.getCurrentViews();
    // let windowClose = true;

    // const beforeUnloadDialog = await fin.Window.create({ 
    //     name: 'before-unload-dialog', 
    //     uuid: fin.me.identity.uuid, 
    //     defaultHeight: 225, 
    //     defaultWidth: 400, 
    //     autoShow: false,
    //     defaultCentered: true,
    //     alwaysOnTop: true,
    //     saveWindowState: false,
    //     maximizable: false,
    //     resizable: false,
    //     modalParentIdentity: fin.me.identity
    // });

    // beforeUnloadDialog.on('blurred', () => {
    //     beforeUnloadDialog.focus();
    // })

    // beforeUnloadDialog.on('close-requested', async () => {
    //     await beforeUnloadDialog.hide();
    //     willPreventUnload = [];
    //     beforeUnloadFired = []
    // });

    // fin.me.on('close-requested', async (event) => {
    //     // windowClose = true;
    //     currentViews = await fin.me.getCurrentViews();

    //     const triggerBeforeUnloadOnAllViews = currentViews.map(async (view) => {
    //         const unloadPrevented = await view.triggerBeforeUnload();
            
    //         if (unloadPrevented) {
    //             willPreventUnload.push(view.identity.name);
    //         }

    //         beforeUnloadFired.push(view.identity.name);
    //     });

    //     await Promise.all(triggerBeforeUnloadOnAllViews);

    //     // fin.me.close(true);

    //     if (willPreventUnload.length > 0) { 
    //         launchDialog();
    //     }
    // });

    // fin.me.on('view-destroyed', async () => {
    //     currentViews = await fin.me.getCurrentViews();

    //     if (currentViews.length === 0) {
    //         fin.me.close(true);
    //     }
    // });

    // const checker = (arr, target) => target.every(v => arr.includes(v));

    // const finishedGoingThroughViews = async () => {
    //     const viewNamesArr = currentViews.map(v => v.identity.name);
    //     return checker(beforeUnloadFired, viewNamesArr) && willPreventUnload.length > 0;
    // }

    // const launchDialog = async () => {
    //     const winIdString = JSON.stringify(fin.me.identity);
    //     const willPreventUnloadString = JSON.stringify({ willPreventUnload });
    //     const queryString = new URLSearchParams(`winId=${winIdString}&willPreventUnload=${willPreventUnloadString}`);
    //     const baseUrl = window.location.href.replace('platform-window', 'before-unload-dialog');
    //     const url = `${baseUrl}?${queryString.toString()}`;
    //     // await fin.Window.create({ name: 'before-unload-dialog', url });
    //     await beforeUnloadDialog.navigate(url);
    //     await beforeUnloadDialog.show();
    // }

    // Before .50 AI version this may throw...
    await fin.Platform.Layout.init({ containerId: CONTAINER_ID });
});
