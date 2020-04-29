import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { saveSnapShot } from './platform-store.js';
import './layout-container-binding.js';
import './components/header/lock-unlock-component.js';
import './components/header/pin-unpin-component.js';
import './components/header/window-maximize-component.js';
import './components/header/window-minimize-component.js';
import './components/header/save-snapshot-close-all-component.js';
import './components/header/save-restore-layout-component.js';

class TitleBarMain extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
        this.init();
    }

    checkForLastView() {
        // could use the ability to return the views for a window but we want the tab element as we are adding/removing a class
        if(window.document.querySelectorAll('.tab-button').length === 1){
            window.document.querySelector('.tab-button').classList.add('last-tab-button');
        } else {
            let markedTab = window.document.querySelector('.last-tab-button');
            if(markedTab !== undefined && markedTab !== null) {
                markedTab.classList.remove('last-tab-button');
            }
        }
    }

    async init() {
        const finWindow = await fin.Window.getCurrent();

        finWindow.on("view-attached", this.checkForLastView);

        finWindow.on("view-detached", this.checkForLastView);

        const platform = await fin.Platform.getCurrent();

        platform.on("window-blurred", async (args)=> {
            // taking a snapshot so that we have the last good snapshot since the last interaction with a window
            // putting this on the event loop after two seconds so it doesn't trigger straight away when a user clicks
            // from one platform window to another in case they are clicking a button to also capture the layout.
            setTimeout(async () => {
                await saveSnapShot();
                console.log("Platform has detected a window blur event and saved a snapshot.");
            }, 2000);
        });

        finWindow.on('close-requested', async () => {
            let currentLayout;
            let currentLayoutConfig;
            try {
                // in case it is not available we still want to close the platform
                currentLayout = fin.Platform.Layout.getCurrentSync();
                currentLayoutConfig = await currentLayout.getConfig();
            } catch(err) {
                console.error("Error when trying to get current layout config: ", err);
            }

            if(currentLayoutConfig !== undefined && currentLayoutConfig.content.length === 0) {
                // this is just a way of enforcing that a main window should not close because the last view was removed
                // and that it should always have at least one view in there
               const layout = fin.Platform.Layout.wrapSync(finWindow.identity);

               const newLayout = {
                   content: [
                       {
                           type: "stack",
                           content: [
                               {
                                   type: "component",
                                   componentName: "view",
                                   componentState: {
                                       processAffinity: "ps_1",
                                       url: "https://cdn.openfin.co/embed-web/chart.html"
                                   }
                               }
                           ]
                       }
                   ]
               };

               layout.replace(newLayout);
            } else {
                // it was closed by the taskbar for example
                await this.closePlatform();
            }
        });

        await finWindow.setAsForeground();
    }

    async closePlatform() {
        const platform = await fin.Platform.getCurrent();
        platform.quit();
    }

    async render() {
        const titleBar = html`
        <div id="title-bar">
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                <save-restore-layout></save-restore-layout>
                <lock-unlock></lock-unlock>
                <pin-unpin></pin-unpin>
                <window-minimize></window-minimize>
                <window-maximize></window-maximize>
                <save-snapshot-close-all></save-snapshot-close-all>
                </div>
            </div>`;
        return render(titleBar, this);
    }
}

customElements.define('title-bar-main', TitleBarMain);
