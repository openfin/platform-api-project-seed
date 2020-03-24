import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { componentNameGenerator } from './component-name-generator.js'
import { saveSnapShot } from './platform-store.js';

class TitleBarMain extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
        this.maxOrRestore = this.maxOrRestore.bind(this);
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
                    <div class="button" id="minimize-button" title='Minimise Window' @click=${() => fin.me.minimize().catch(console.error)}></div>
                    <div class="button" id="expand-button" title='Maximise Window' @click=${() => this.maxOrRestore().catch(console.error)}></div>
                    <div class="button" id="close-button" title='Close Window' @click=${() => fin.me.close().catch(console.error)}></div>
                </div>
            </div>`;
        return render(titleBar, this);
    }

    async maxOrRestore() {
        if (await fin.me.getState() === "normal") {
            return await fin.me.maximize();
        }

        return fin.me.restore();
    }
}

customElements.define('title-bar-main', TitleBarMain);
