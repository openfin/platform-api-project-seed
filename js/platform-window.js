import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { getTemplates, storeTemplate, getTemplateByName, onStoreUpdate } from './template-store.js';

window.addEventListener('DOMContentLoaded', () => {
    const containerId = 'layout-container';
    try {
        fin.Platform.Layout.init({containerId});
    } catch(e) {
        // don't throw me - after .50/.51 it won't error anymore
    }
});

const CHART_URL = 'https://cdn.openfin.co/embed-web/chart.html';
const LAYOUT_STORE_KEY  = 'LayoutMenu';
const WORKSPACE_STORE_KEY = 'WorkspaceMenu';

//Our Left Menu element
class LeftMenu extends HTMLElement {
    constructor() {
        super();
        this.render = this.render.bind(this);
        this.addView = this.addView.bind(this);
        this.toGrid = this.toGrid.bind(this);
        this.toTabbed = this.toTabbed.bind(this);
        this.toRows = this.toRows.bind(this);
        this.cloneWindow = this.cloneWindow.bind(this);
        this.nonLayoutWindow = this.nonLayoutWindow.bind(this);
        this.toggleWorkspaceSaveMenu = this.toggleWorkspaceSaveMenu.bind(this);
        this.toggleLayoutSaveMenu = this.toggleLayoutSaveMenu.bind(this);
        this.replaceLayoutFromTemplate = this.replaceLayoutFromTemplate.bind(this);
        this.applySnapshotFromTemplate = this.applySnapshotFromTemplate.bind(this);

        //List of apps available in the menu.
        this.appList = [
            {
                url: CHART_URL,
                printName: 'OF Chart',
                processAffinity: 'ps_1'
            },
            {
                url: 'https://www.tradingview.com/chart/?symbol=NASDAQ:AAPL',
                printName: 'TradeView',
                processAffinity: 'tv_1'
            },
            {
                url: 'https://www.google.com/search?q=INDEXDJX:+.DJI&stick=H4sIAAAAAAAAAONgecRozC3w8sc9YSmtSWtOXmNU4eIKzsgvd80rySypFBLjYoOyeKS4uDj0c_UNkgsry3kWsfJ5-rm4Rrh4RVgp6Ll4eQIAqJT5uUkAAAA&source=lnms&sa=X&ved=0ahUKEwii_NWT9fzoAhU3mHIEHWy3AWIQ_AUIDSgA&biw=1280&bih=1366&dpr=1',
                printName: 'News',
                processAffinity: 'mw_1'
            }
        ];

        this.render();

        //Whenever the store updates we will want to render any new elements.
        onStoreUpdate(() => { this.render(); });
    }

    async render() {
        const layoutTemplates = getTemplates(LAYOUT_STORE_KEY);
        const workspaceTemplates = getTemplates(WORKSPACE_STORE_KEY);
        const menuItems = html`
        <span>Apps</span>
        <ul>
            ${this.appList.map((item) => html`<li>
                  <button @click=${() => this.addView(item.printName)}>${item.printName}</button>
              </li>`)}
                <li><button @click=${() => this.nonLayoutWindow().catch(console.error)}>OF Window</button></li>
        </ul>
        <span>Layout</span>
        <ul>
            <li><button @click=${() => this.toGrid().catch(console.error)}>Grid</button></li>
            <li><button @click=${() => this.toTabbed().catch(console.error)}>Tab</button></li>
            ${layoutTemplates.map((item) => html`<li>
                  <button @click=${() => this.replaceLayoutFromTemplate(item.name)}>${item.name}</button>
              </li>`)}
            <li><button @click=${() => this.cloneWindow().catch(console.error)}>Clone</button></li>
            <li><button @click=${() => this.toggleLayoutSaveMenu().catch(console.error)}>Save</button></li>
        </ul>
        <span>Workspace</span>
        <ul>
            ${workspaceTemplates.map((item) => html`<li><button @click=${() => this.applySnapshotFromTemplate(item.name)}>${item.name}</button></li>`)}
            <li><button @click=${() => this.toggleWorkspaceSaveMenu()}>Save</button></li>
        </ul>`;
        return render(menuItems, this);
    }

    async applySnapshotFromTemplate(templateName) {
        const template = getTemplateByName(WORKSPACE_STORE_KEY, templateName);
        return fin.Platform.getCurrentSync().applySnapshot(template.snapshot, {
            closeExistingWindows: template.close
        });

    }

    async replaceLayoutFromTemplate(templateName) {
        const templates = getTemplates(LAYOUT_STORE_KEY);
        const templateToUse = templates.find(i => i.name === templateName);
        fin.Platform.Layout.getCurrentSync().replace(templateToUse.layout);
    }

    async toggleLayoutSaveMenu() {
        document.querySelector('layout-menu').toggleVisibility();
    }

    async toggleWorkspaceSaveMenu() {
        document.querySelector('workspace-menu').toggleVisibility();
    }

    async addView(printName) {
        const viewOptions = this.appList.find(i => i.printName === printName);
        return fin.Platform.getCurrentSync().createView(viewOptions, fin.me.identity);
    }

    async toGrid() {
        await fin.Platform.Layout.getCurrentSync().applyPreset({
            presetType: 'grid'
        });
    }

    async toTabbed() {
        await fin.Platform.Layout.getCurrentSync().applyPreset({
            presetType: 'tabs'
        });
    }
    async toRows() {
        await fin.Platform.Layout.getCurrentSync().applyPreset({
            presetType: 'rows'
        });
    }

    async cloneWindow() {
        const layout = await fin.Platform.Layout.getCurrentSync().getConfig();
        const snapshot = {
            windows: [
                {
                    layout
                }
            ]
        };

        return fin.Platform.getCurrentSync().applySnapshot(snapshot);
    }

    async nonLayoutWindow() {
        return fin.Platform.getCurrentSync().applySnapshot({
            windows: [{
                defaultWidth: 600,
                defaultHeight: 600,
                defaultLeft: 200,
                defaultTop: 200,
                saveWindowState: false,
                url: CHART_URL,
                contextMenu: true
            }]
        });
    }
}

//Our Title bar element
class TitleBar extends HTMLElement {
    constructor() {
        super();
        this.render = this.render.bind(this);
        this.maxOrRestore = this.maxOrRestore.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);

        this.render();
    }

    async render() {
        const titleBar = html`
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                    <div class="button" id="minimize-button" @click=${() => fin.me.minimize().catch(console.error)}></div>
                    <div class="button" id="expand-button" @click=${() => this.maxOrRestore().catch(console.error)}></div>
                    <div class="button" id="close-button" @click=${() => fin.me.close().catch(console.error)}></div>
                </div>`;
        return render(titleBar, this);
    }

    async maxOrRestore() {
        if (await fin.me.getState() === "normal") {
            return await fin.me.maximize();
        }

        return fin.me.restore();
    }

    //leave this for when we have a better menu icon.
    toggleMenu () {
        document.querySelector('left-menu').classList.toggle('hidden');
    }
}

class LayoutMenu extends HTMLElement {
    constructor() {
        super();
        this.render = this.render.bind(this);
        this.saveAsTemplate = this.saveAsTemplate.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.cancel = this.cancel.bind(this);

        this.templateStorageKey = this.constructor.name;
        this.render();
    }

    async saveAsTemplate() {
        const name = this.querySelector('#template-name').value;
        const templateObject = {
            name,
            layout: await fin.Platform.Layout.getCurrentSync().getConfig()
        };

        storeTemplate(this.templateStorageKey, templateObject);

        this.toggleVisibility();
        return;
    }

    toggleVisibility() {
        this.classList.toggle('hidden');
        document.querySelector('#layout-container').classList.toggle('hidden');
    }

    cancel() {
        this.toggleVisibility();
    }

    async render() {
        const titleBar = html`
            <fieldset>
                 <legend>Save as Layout template</legend>
                 <input type="text" id="template-name" size="50"
                     value="New template"/> <br>
                 <button @click=${this.saveAsTemplate}>Save</button>
                 <button @click=${this.cancel}>Cancel</button>
             </fieldset>`;
        return render(titleBar, this);
    }
}

class WorkspaceMenu extends LayoutMenu {
    constructor() {
        super();
    }

    async saveAsTemplate() {
        const name = this.querySelector('#template-name').value;
        const close = this.querySelector('#close').checked;

        console.log(name, close);
        const templateObject = {
            name,
            snapshot: await fin.Platform.getCurrentSync().getSnapshot(),
            close
        };

        storeTemplate(this.templateStorageKey, templateObject);

        this.toggleVisibility();
        return;
    }

    async render() {
        const titleBar = html`
            <fieldset>
                 <legend>Save Workspace as template</legend>
                 <input type="text" id="template-name" size="50"
                     value="New template"/> <br>
                 <input type="checkbox" id="close" name="close"
                     checked>
                 <label for="close">Close current Workspace on restore</label> <br>
                 <button @click=${this.saveAsTemplate}>Save</button>
                 <button @click=${this.cancel}>Cancel</button>
             </fieldset>`;
        return render(titleBar, this);
    }
}

customElements.define('left-menu', LeftMenu);
customElements.define('title-bar', TitleBar);
customElements.define('layout-menu', LayoutMenu);
customElements.define('workspace-menu', WorkspaceMenu);
