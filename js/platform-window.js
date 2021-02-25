export const CONTAINER_ID = 'layout-container';
window.addEventListener('DOMContentLoaded', () => {
    // fin.me.showDeveloperTools().then(() => console.log('Showing dev tools')).catch(err => console.error(err));

    // Before .50 AI version this may throw...
    fin.Platform.Layout.init({containerId: CONTAINER_ID});

    // This is for setting the tab color on drags.
    fin.Window.getCurrentSync().addListener('view-shown', (evt) => {
        console.log('evt view shown', evt);
        fin.View.wrapSync(evt.viewIdentity).getOptions().then((opts) => {
            console.log('opts view-shown', opts)
            if (opts.interop && opts.interop.currentContextGroup) {
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.remove('red-channel', 'green-channel', 'pink-channel', 'orange-channel', 'purple-channel', 'yellow-channel');
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.add(`${opts.interop.currentContextGroup}-channel`);    
            }
        })
    });

    // This is for setting the tab color on snapshot applied.
    fin.Window.getCurrentSync().addListener('view-attached', (evt) => {
        console.log('evt view attached', evt);
        fin.View.wrapSync(evt.viewIdentity).getOptions().then((opts) => {
            console.log('opts view-attached', opts)
            if (opts.interop && opts.interop.currentContextGroup) {
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.remove('red-channel', 'green-channel', 'pink-channel', 'orange-channel', 'purple-channel', 'yellow-channel');
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.add(`${opts.interop.currentContextGroup}-channel`);    
            }
        })
    });
});
