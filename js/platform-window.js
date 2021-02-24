export const CONTAINER_ID = 'layout-container';
window.addEventListener('DOMContentLoaded', () => {
    // fin.me.showDeveloperTools().then(() => console.log('Showing dev tools')).catch(err => console.error(err));

    // Before .50 AI version this may throw...
    fin.Platform.Layout.init({containerId: CONTAINER_ID});

    fin.Window.getCurrentSync().addListener('view-shown', (evt) => {
        console.log('evt view shown', evt);
        fin.View.wrapSync(evt.viewIdentity).getOptions().then((opts) => {
            console.log('opts view-shown', opts)
            if (opts.interop && opts.interop.contextGroupDeclaration) {
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.remove('red-channel', 'green-channel', 'pink-channel', 'orange-channel', 'purple-channel', 'yellow-channel');
                document.getElementById(`tab-${evt.viewIdentity.name}`).classList.add(`${opts.interop.contextGroupDeclaration}-channel`);    
            }
        })
    });
});
