import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { componentNameGenerator } from './component-name-generator.js'
import { saveSnapShot } from './platform-store.js';
import './layout-container-binding.js';
import './components/header/lock-unlock-component.js';
import './components/header/pin-unpin-component.js';
import './components/header/maximize-minimize-close-component.js';
import './components/header/save-restore-layout-component.js';

class TitleBarMain extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
        this.init();
    }

    checkForLastView() {
        if(window.document.querySelectorAll('.tab-button').length === 1){
            window.document.querySelector('.tab-button').classList.add('last-tab-button');
        } else {
            let markedTab = window.document.querySelector('.last-tab-button');
            if(markedTab !== undefined && markedTab !== null) {
                markedTab.classList.remove('last-tab-button');
            }
        }
    }

    closedBecauseOfSnapshotReplace() {
        let key = 'action-replace-from-snapshot';
        let snapShotAction =  sessionStorage.getItem(key) !== null;
        if(snapShotAction) {
            sessionStorage.removeItem(key);
        }
        return snapShotAction;
    }

    async init() {

        const finWindow = await fin.Window.getCurrent();

        finWindow.on("view-attached", this.checkForLastView);

        finWindow.on("view-detached", this.checkForLastView);

        finWindow.on('close-requested', async () => {
            let currentLayout = await fin.Platform.Layout.getCurrentSync().getConfig();
            if(currentLayout.content.length > 0) {
                // close the platform
                await saveSnapShot();
                const platform = await fin.Platform.getCurrent();
                platform.quit();
            } else {
               const layout = fin.Platform.Layout.wrapSync(finWindow.identity);

               const newLayout = {
                   content: [
                       {
                           type: "stack",
                           id: "no-drop-target",
                           content: [
                               {
                                   type: "component",
                                   componentName: "view",
                                   componentState: {
                                       name: componentNameGenerator(),
                                       processAffinity: "ps_1",
                                       url: "https://cdn.openfin.co/embed-web/chart.html"
                                   }
                               }
                           ]
                       }
                   ]
               };

               layout.replace(newLayout);
            }
        });

        await finWindow.setAsForeground();
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
                <maximize-minimize-close></maximize-minimize-close>
                </div>
            </div>`;
        return render(titleBar, this);
    }
}

customElements.define('title-bar-main', TitleBarMain);
