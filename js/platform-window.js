import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { getTemplates, storeTemplate, getTemplateByName, onStoreUpdate } from './template-store.js';
import { CHART_URL, TRADEVIEW_URL, NEWS_URL } from './constants.js';


window.addEventListener('DOMContentLoaded', () => {
    console.log('dom content');

    fin.me.on('layout-ready', async () => {
        // Whenever a new layout is ready on this window (on init, replace, or applyPreset)
        const { settings } = await fin.Platform.Layout.getCurrentSync().getConfig();
        // determine whether it is locked and update the icon
        if(settings.hasHeaders && settings.reorderEnabled) {
            document.getElementById('lock-button').classList.remove('layout-locked');
        } else {
            document.getElementById('lock-button').classList.add('layout-locked');
        }
    });
    // Before .50 AI version this may throw...
    fin.Platform.Layout.init({containerId: CONTAINER_ID});
});

const LAYOUT_STORE_KEY  = 'LayoutMenu';
const SNAPSHOT_STORE_KEY = 'SnapshotMenu';
const CONTAINER_ID = 'layout-container';

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
        this.replaceLayoutFromTemplate = this.replaceLayoutFromTemplate.bind(this);
        this.applySnapshotFromTemplate = this.applySnapshotFromTemplate.bind(this);
        this.onclick = this.clickHandler.bind(this);

        //List of apps available in the menu.
        this.appList = [
            {
                url: CHART_URL,
                printName: 'OF Chart',
            },
            {
                url: TRADEVIEW_URL,
                printName: 'TradeView',
            },
            {
                url: NEWS_URL,
                printName: 'News',
            }
        ];

        this.snapshotMenu = document.querySelector('snapshot-menu');
        this.layoutMenu = document.querySelector('layout-menu');
        this.layoutContainer = document.querySelector('#layout-container');

        this.render();

        //Whenever the store updates we will want to render any new elements.
        onStoreUpdate(() => { this.render(); });
    }

    clickHandler(e) {
        const target = e.target;

        if (target.className === 'snapshot-button' || target.className === 'layout-button') {
            if (!this.layoutContainer.classList.contains('hidden')) {
                this.layoutContainer.classList.toggle('hidden');
            }
        }

        if (target.className === 'snapshot-button') {
            this.snapshotMenu.showElement();
            this.layoutMenu.hideElement();
        } else if (target.className === 'layout-button') {
            this.layoutMenu.showElement();
            this.snapshotMenu.hideElement();
        } else {
            this.layoutMenu.hideElement();
            this.snapshotMenu.hideElement();

            if (this.layoutContainer.classList.contains('hidden')) {
                this.layoutContainer.classList.toggle('hidden');
            }
        }
    }

    async render() {
        const layoutTemplates = getTemplates(LAYOUT_STORE_KEY);
        const snapshotTemplates = getTemplates(SNAPSHOT_STORE_KEY);
        const menuItems = html`
        <span>Applications</span>
        <ul>
            ${this.appList.map((item) => html`<li>
                  <button @click=${() => this.addView(item.printName)}>${item.printName}</button>
              </li>`)}
                <li><button @click=${() => this.nonLayoutWindow().catch(console.error)}>OF Window</button></li>
        </ul>
        <span>Layouts</span>
        <ul>
            <li><button @click=${() => this.toGrid().catch(console.error)}>Grid</button></li>
            <li><button @click=${() => this.toTabbed().catch(console.error)}>Tab</button></li>
            ${layoutTemplates.map((item) => html`<li>
                  <button @click=${() => this.replaceLayoutFromTemplate(item.name)}>${item.name}</button>
              </li>`)}
            <li><button @click=${() => this.cloneWindow().catch(console.error)}>Clone</button></li>
            <li><button class="layout-button">Save Layout</button></li>
        </ul>
        <span>Snapshots</span>
        <ul>
            ${snapshotTemplates.map((item) => html`<li><button @click=${() => this.applySnapshotFromTemplate(item.name)}>${item.name}</button></li>`)}
            <li><button class="snapshot-button">Save Snapshot</button></li>
        </ul>`;
        return render(menuItems, this);
    }

    async applySnapshotFromTemplate(templateName) {
        const template = getTemplateByName(SNAPSHOT_STORE_KEY, templateName);
        return fin.Platform.getCurrentSync().applySnapshot(template.snapshot, {
            closeExistingWindows: template.close
        });

    }

    async replaceLayoutFromTemplate(templateName) {
        const templates = getTemplates(LAYOUT_STORE_KEY);
        const templateToUse = templates.find(i => i.name === templateName);
        fin.Platform.Layout.getCurrentSync().replace(templateToUse.layout);
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
        const bounds = await fin.me.getBounds();
        const layout = await fin.Platform.Layout.getCurrentSync().getConfig();
        const snapshot = {
            windows: [
                {
                    defaultWidth: bounds.width,
                    defaultHeight: bounds.height,
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
        this.LIGHT_THEME_CLASS = 'light-theme';
        this.DEFAULT_THEME = 'default';

        this.render = this.render.bind(this);
        this.maxOrRestore = this.maxOrRestore.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.setTheme = this.setTheme.bind(this);

        this.render();

        fin.Platform.getCurrentSync().getWindowContext().then(context => {
            if (context) {
                this.setTheme(context.theme);
            }

        });

        fin.Platform.getCurrentSync().on('window-context-changed', evt => {
            if (evt.context) {
                this.setTheme(evt.context.theme);
            }
        });
    }

    async render() {
        const titleBar = html`
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                    <div class="button" title="Toggle Theme" id="theme-button" @click=${this.toggleTheme}></div>
                    <div class="button" title="Toggle Sidebar" id="menu-button" @click=${this.toggleMenu}></div>
                    <div class="button" title="Toggle Layout Lock" id="lock-button" @click=${this.toggleLockedLayout}></div>
                    <div class="button" title="Minimize Window" id="minimize-button" @click=${() => fin.me.minimize().catch(console.error)}></div>
                    <div class="button" title="Maximize Window" id="expand-button" @click=${() => this.maxOrRestore().catch(console.error)}></div>
                    <div class="button" title="Close Window" id="close-button" @click=${() => fin.me.close().catch(console.error)}></div>
                </div>`;
        return render(titleBar, this);
    }

    async maxOrRestore() {
        if (await fin.me.getState() === 'normal') {
            return await fin.me.maximize();
        }

        return fin.me.restore();
    }

    async toggleLockedLayout () {
        const oldLayout = await fin.Platform.Layout.getCurrentSync().getConfig();
        const { settings, dimensions } = oldLayout;
        if(settings.hasHeaders && settings.reorderEnabled) {
            fin.Platform.Layout.getCurrentSync().replace({
                ...oldLayout,
                settings: {
                    ...settings,
                    hasHeaders: false,
                    reorderEnabled: false
                }
            });
        } else {
            fin.Platform.Layout.getCurrentSync().replace({
                ...oldLayout,
                settings: {
                    ...settings,
                    hasHeaders: true,
                    reorderEnabled: true
                },
                dimensions: {
                    ...dimensions,
                    headerHeight: 25
                }
            });
        }
    };

    async toggleTheme () {
        let themeName = this.DEFAULT_THEME;
        if (!document.documentElement.classList.contains(this.LIGHT_THEME_CLASS)) {
            themeName = this.LIGHT_THEME_CLASS;
        }
        this.setTheme(themeName);
    }

    async setTheme(theme) {
        const root = document.documentElement;

        if (theme === this.LIGHT_THEME_CLASS) {
            root.classList.add(this.LIGHT_THEME_CLASS);

        } else {
            root.classList.remove(this.LIGHT_THEME_CLASS);
        }

        const context = await fin.Platform.getCurrentSync().getWindowContext() || {};
        if (context.theme !== theme) {
            fin.Platform.getCurrentSync().setWindowContext({theme});
        }
    }
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
        const name = this.querySelector('.template-name').value;
        const templateObject = {
            name,
            layout: await fin.Platform.Layout.getCurrentSync().getConfig()
        };

        storeTemplate(this.templateStorageKey, templateObject);

        this.toggleVisibility();
        return;
    }

    hideElement() {
        this.classList.add('hidden');
    }

    showElement() {
        this.classList.remove('hidden');
    }

    toggleVisibility() {
        this.classList.toggle('hidden');
        document.querySelector('#layout-container').classList.toggle('hidden');
    }

    cancel() {
        this.toggleVisibility();
    }

    async render() {
        const layoutMenu = html`
            <fieldset>
                 <legend>Save the current Views in this Window as a Layout template</legend>
                 <input type="text" class="template-name" size="50"
                     value="New Layout"/> <br>
                 <button @click=${this.saveAsTemplate}>Save Layout</button>
                 <button @click=${this.cancel}>Cancel</button>
             </fieldset>`;
        return render(layoutMenu, this);
    }
}

class SnapshotMenu extends LayoutMenu {
    constructor() {
        super();
    }

    async saveAsTemplate() {
        const name = this.querySelector('.template-name').value;
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
        const snapshotMenu = html`
            <fieldset>
                 <legend>Save all current Platform Windows as a Snapshot</legend>
                 <input type="text" class="template-name" size="50"
                     value="New Snapshot"/> <br>
                 <input type="checkbox" id="close" name="close"
                     checked>
                 <label for="close">Close Platform before restoring Snapshot</label> <br>
                 <button @click=${this.saveAsTemplate}>Save Snapshot</button>
                 <button @click=${this.cancel}>Cancel</button>
             </fieldset>`;
        return render(snapshotMenu, this);
    }
}

customElements.define('left-menu', LeftMenu);
customElements.define('title-bar', TitleBar);
customElements.define('layout-menu', LayoutMenu);
customElements.define('snapshot-menu', SnapshotMenu);
