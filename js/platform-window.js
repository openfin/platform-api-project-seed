import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { getTemplates, storeTemplate, getTemplateByName, onStoreUpdate } from './template-store.js';

window.addEventListener('DOMContentLoaded', () => {

    fin.me.on('layout-ready', async () => {
        // Whenever a new layout is ready on this window (on init, replace, or applyPreset)
        const { settings } = await fin.Platform.Layout.getCurrentSync().getConfig();
        // determine whether it is locked and update the icon
        if(settings.hasHeaders && settings.reorderEnabled) {
            document.getElementById('lock-button').firstChild.src = UNLOCKED_SVG;
        } else {
            document.getElementById('lock-button').firstChild.src = LOCKED_SVG;
        }
    });
    // Before .50 AI version this may throw...
    fin.Platform.Layout.init({CONTAINER_ID});
});

const LOCKED_SVG = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzkyOTI5MiIgaWQ9Imljb24tMTE0LWxvY2siPjxwYXRoIGQ9Ik0xNiwyMS45MTQ2NDcyIEwxNiwyNC41MDg5OTQ4IEMxNiwyNC43ODAxNjk1IDE2LjIzMTkzMzYsMjUgMTYuNSwyNSBDMTYuNzc2MTQyNCwyNSAxNywyNC43NzIxMTk1IDE3LDI0LjUwODk5NDggTDE3LDIxLjkxNDY0NzIgQzE3LjU4MjU5NjIsMjEuNzA4NzI5IDE4LDIxLjE1MzEwOTUgMTgsMjAuNSBDMTgsMTkuNjcxNTcyOCAxNy4zMjg0MjcyLDE5IDE2LjUsMTkgQzE1LjY3MTU3MjgsMTkgMTUsMTkuNjcxNTcyOCAxNSwyMC41IEMxNSwyMS4xNTMxMDk1IDE1LjQxNzQwMzgsMjEuNzA4NzI5IDE2LDIxLjkxNDY0NzIgTDE2LDIxLjkxNDY0NzIgTDE2LDIxLjkxNDY0NzIgWiBNMTUsMjIuNTAwMTgzMSBMMTUsMjQuNDk4MzI0NCBDMTUsMjUuMzI3Njc2OSAxNS42NjU3OTcyLDI2IDE2LjUsMjYgQzE3LjMyODQyNzEsMjYgMTgsMjUuMzI4ODEwNiAxOCwyNC40OTgzMjQ0IEwxOCwyMi41MDAxODMxIEMxOC42MDcyMjM0LDIyLjA0NDA4IDE5LDIxLjMxNzkwOSAxOSwyMC41IEMxOSwxOS4xMTkyODgxIDE3Ljg4MDcxMTksMTggMTYuNSwxOCBDMTUuMTE5Mjg4MSwxOCAxNCwxOS4xMTkyODgxIDE0LDIwLjUgQzE0LDIxLjMxNzkwOSAxNC4zOTI3NzY2LDIyLjA0NDA4IDE1LDIyLjUwMDE4MzEgTDE1LDIyLjUwMDE4MzEgTDE1LDIyLjUwMDE4MzEgWiBNOSwxNC4wMDAwMTI1IEw5LDEwLjQ5OTIzNSBDOSw2LjM1NjcwNDg1IDEyLjM1Nzg2NDQsMyAxNi41LDMgQzIwLjYzMzcwNzIsMyAyNCw2LjM1NzUyMTg4IDI0LDEwLjQ5OTIzNSBMMjQsMTQuMDAwMDEyNSBDMjUuNjU5MTQ3MSwxNC4wMDQ3NDg4IDI3LDE1LjM1MDMxNzQgMjcsMTcuMDA5NDc3NiBMMjcsMjYuOTkwNTIyNCBDMjcsMjguNjYzMzY4OSAyNS42NTI5MTk3LDMwIDIzLjk5MTIxMiwzMCBMOS4wMDg3ODc5OSwzMCBDNy4zNDU1OTAxOSwzMCA2LDI4LjY1MjYxMSA2LDI2Ljk5MDUyMjQgTDYsMTcuMDA5NDc3NiBDNiwxNS4zMzk1ODEgNy4zNDIzMzM0OSwxNC4wMDQ3MTUyIDksMTQuMDAwMDEyNSBMOSwxNC4wMDAwMTI1IEw5LDE0LjAwMDAxMjUgWiBNMTAsMTQgTDEwLDEwLjQ5MzQyNjkgQzEwLDYuOTA4MTcxNzEgMTIuOTEwMTQ5MSw0IDE2LjUsNCBDMjAuMDgyNTQ2Miw0IDIzLDYuOTA3MjA2MjMgMjMsMTAuNDkzNDI2OSBMMjMsMTQgTDIyLDE0IEwyMiwxMC41MDkwNzMxIEMyMiw3LjQ2NjQ5NjAzIDE5LjUzMTM4NTMsNSAxNi41LDUgQzEzLjQ2MjQzMzksNSAxMSw3LjQ2MTQwMjg5IDExLDEwLjUwOTA3MzEgTDExLDE0IEwxMCwxNCBMMTAsMTQgWiBNMTIsMTQgTDEyLDEwLjUwMDg1MzcgQzEyLDguMDA5MjQ3OCAxNC4wMTQ3MTg2LDYgMTYuNSw2IEMxOC45ODAyMjQzLDYgMjEsOC4wMTUxMDA4MiAyMSwxMC41MDA4NTM3IEwyMSwxNCBMMTIsMTQgTDEyLDE0IEwxMiwxNCBaIE04Ljk5NzQyMTkxLDE1IEM3Ljg5NDI3NjI1LDE1IDcsMTUuODk3MDYwMSA3LDE3LjAwNTg1ODcgTDcsMjYuOTk0MTQxMyBDNywyOC4xMDE5NDY1IDcuODkwOTI1MzksMjkgOC45OTc0MjE5MSwyOSBMMjQuMDAyNTc4MSwyOSBDMjUuMTA1NzIzOCwyOSAyNiwyOC4xMDI5Mzk5IDI2LDI2Ljk5NDE0MTMgTDI2LDE3LjAwNTg1ODcgQzI2LDE1Ljg5ODA1MzUgMjUuMTA5MDc0NiwxNSAyNC4wMDI1NzgxLDE1IEw4Ljk5NzQyMTkxLDE1IEw4Ljk5NzQyMTkxLDE1IFoiIGlkPSJsb2NrIi8+PC9nPjwvZz48L3N2Zz4=';
const UNLOCKED_SVG = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzkyOTI5MiIgaWQ9Imljb24tMTE2LWxvY2stb3BlbiI+PHBhdGggZD0iTTI0LDkuNSBMMjQsOC40OTkyMzUgQzI0LDQuMzU3NTIxODggMjAuNjMzNzA3MiwxIDE2LjUsMSBDMTIuMzU3ODY0NCwxIDksNC4zNTY3MDQ4NSA5LDguNDk5MjM1IEw5LDE2LjAwMDAxMjUgTDksMTYuMDAwMDEyNSBDNy4zNDIzMzM0OSwxNi4wMDQ3MTUyIDYsMTcuMzM5NTgxIDYsMTkuMDA5NDc3NiBMNiwyOC45OTA1MjI0IEM2LDMwLjY1MjYxMSA3LjM0NTU5MDE5LDMyIDkuMDA4Nzg3OTksMzIgTDIzLjk5MTIxMiwzMiBDMjUuNjUyOTE5NywzMiAyNywzMC42NjMzNjg5IDI3LDI4Ljk5MDUyMjQgTDI3LDE5LjAwOTQ3NzYgQzI3LDE3LjM1MDMxNzQgMjUuNjU5MTQ3MSwxNi4wMDQ3NDg4IDI0LDE2IEwyMy40ODYzNTg2LDE2IEwxMi4wMjc0Nzc3LDE2IEMxMi4wMDkzMjIyLDE1LjgzNjAwNDEgMTIsMTUuNjY5MzUyNCAxMiwxNS41MDA1MjkxIEwxMiw4LjQ5OTQ3MDk1IEMxMiw2LjAxMDIxMDE5IDE0LjAxNDcxODYsNCAxNi41LDQgQzE4Ljk4MDIyNDMsNCAyMSw2LjAxNDQ4MTc2IDIxLDguNDk5NDcwOTUgTDIxLDkuNSBMMjEsMTIuNDk5ODM1MSBDMjEsMTMuMzI4MzUzMyAyMS42NjU3OTcyLDE0IDIyLjUsMTQgQzIzLjMyODQyNzEsMTQgMjQsMTMuMzI1Njc3OCAyNCwxMi40OTk4MzUxIEwyNCw5LjUgTDI0LDkuNSBMMjQsOS41IFogTTIzLDguNDkzNDI2ODYgQzIzLDQuOTA3MjA2MjMgMjAuMDgyNTQ2MiwyIDE2LjUsMiBDMTIuOTEwMTQ5MSwyIDEwLDQuOTA4MTcxNzEgMTAsOC40OTM0MjY4NiBMMTAsMTUuNTA2NTczMSBDMTAsMTUuNjcyNTc3NCAxMC4wMDYyNTEzLDE1LjgzNzEyNjYgMTAuMDE4NTMwNCwxNiBMMTEsMTYgTDExLDguNTA5MDczMDYgQzExLDUuNDYxNDAyODkgMTMuNDYyNDMzOSwzIDE2LjUsMyBDMTkuNTMxMzg1MywzIDIyLDUuNDY2NDk2MDMgMjIsOC41MDkwNzMwNiBMMjIsMTIuNTAyMjMzMyBDMjIsMTIuNzc3MTQyMyAyMi4yMzE5MzM2LDEzIDIyLjUsMTMgTDIyLjUsMTMgQzIyLjc3NjE0MjQsMTMgMjMsMTIuNzg0OTQyNiAyMywxMi41MDk1MjE1IEwyMyw5IEwyMyw4LjQ5MzQyNjg2IEwyMyw4LjQ5MzQyNjg2IFogTTE2LDIzLjkxNDY0NzIgTDE2LDI2LjUwODk5NDggQzE2LDI2Ljc4MDE2OTUgMTYuMjMxOTMzNiwyNyAxNi41LDI3IEMxNi43NzYxNDI0LDI3IDE3LDI2Ljc3MjExOTUgMTcsMjYuNTA4OTk0OCBMMTcsMjMuOTE0NjQ3MiBDMTcuNTgyNTk2MiwyMy43MDg3MjkgMTgsMjMuMTUzMTA5NSAxOCwyMi41IEMxOCwyMS42NzE1NzI4IDE3LjMyODQyNzIsMjEgMTYuNSwyMSBDMTUuNjcxNTcyOCwyMSAxNSwyMS42NzE1NzI4IDE1LDIyLjUgQzE1LDIzLjE1MzEwOTUgMTUuNDE3NDAzOCwyMy43MDg3MjkgMTYsMjMuOTE0NjQ3MiBMMTYsMjMuOTE0NjQ3MiBMMTYsMjMuOTE0NjQ3MiBaIE0xNSwyNC41MDAxODMxIEwxNSwyNi40OTgzMjQ0IEMxNSwyNy4zMjc2NzY5IDE1LjY2NTc5NzIsMjggMTYuNSwyOCBDMTcuMzI4NDI3MSwyOCAxOCwyNy4zMjg4MTA2IDE4LDI2LjQ5ODMyNDQgTDE4LDI0LjUwMDE4MzEgQzE4LjYwNzIyMzQsMjQuMDQ0MDggMTksMjMuMzE3OTA5IDE5LDIyLjUgQzE5LDIxLjExOTI4ODEgMTcuODgwNzExOSwyMCAxNi41LDIwIEMxNS4xMTkyODgxLDIwIDE0LDIxLjExOTI4ODEgMTQsMjIuNSBDMTQsMjMuMzE3OTA5IDE0LjM5Mjc3NjYsMjQuMDQ0MDggMTUsMjQuNTAwMTgzMSBMMTUsMjQuNTAwMTgzMSBMMTUsMjQuNTAwMTgzMSBaIE04Ljk5NzQyMTkxLDE3IEM3Ljg5NDI3NjI1LDE3IDcsMTcuODk3MDYwMSA3LDE5LjAwNTg1ODcgTDcsMjguOTk0MTQxMyBDNywzMC4xMDE5NDY1IDcuODkwOTI1MzksMzEgOC45OTc0MjE5MSwzMSBMMjQuMDAyNTc4MSwzMSBDMjUuMTA1NzIzOCwzMSAyNiwzMC4xMDI5Mzk5IDI2LDI4Ljk5NDE0MTMgTDI2LDE5LjAwNTg1ODcgQzI2LDE3Ljg5ODA1MzUgMjUuMTA5MDc0NiwxNyAyNC4wMDI1NzgxLDE3IEw4Ljk5NzQyMTkxLDE3IEw4Ljk5NzQyMTkxLDE3IFoiIGlkPSItb2NrLW9wZW4iLz48L2c+PC9nPjwvc3ZnPg==';
const MENU_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAAS0lEQVRoge3WoRGAMAADwJZJu0QlCtkluiksAIfhGsG/jUlcSgEAcupT0PZxrizyZh79tuu2usjXDACAJF8ozQAASPKF0gwAAP7sAvoWDBbvdnE+AAAAAElFTkSuQmCC';
const CHART_URL = 'https://cdn.openfin.co/embed-web/chart.html';
const LAYOUT_STORE_KEY  = 'LayoutMenu';
const WORKSPACE_STORE_KEY = 'WorkspaceMenu';
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
                    <div class="button" id="menu-button" @click=${this.toggleMenu}>
                        <img src="${MENU_ICON}"/>
                    </div>
                    <div class="button" id="lock-button" @click=${this.toggleLockedLayout}><img></div>
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
                    headerHeight: 20
                }
            });
        }
    };

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
