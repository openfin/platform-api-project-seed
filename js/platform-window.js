import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

window.addEventListener('DOMContentLoaded', () => {
    const containerId = 'layout-container';

    fin.me.on('layout-ready', async () => {
        // Whenever a new layout is ready on this window (on init, replace, or applyPreset)
        const { settings } = await fin.Platform.Layout.getCurrentSync().getConfig();
        // determine whether it is locked and update the icon
        if(settings.hasHeaders && settings.reorderEnabled) {
            document.getElementById('lock-button').firstChild.src = unlockedSvg;
        } else {
            document.getElementById('lock-button').firstChild.src = lockedSvg;
        }
    });

    const viewCreate = fin.View.create;
    fin.View.create = async function(...args) {
        console.log('fin.View.create', args);
        let view = await (viewCreate.apply(fin.View, args));
        let handler = {
            get: function(target, prop) {
                if(prop === 'then') {
                    return undefined;
                }

                console.log(`View.${prop}`);
                return target[prop];
            }
        }
        let viewProxy = new Proxy(view, handler);
        return viewProxy;
    }

    const viewWrapSync = fin.View.wrapSync;
    fin.View.wrapSync = function(...args) {
        console.log('fin.View.wrapSync', args);
        let view = viewWrapSync.apply(fin.View, args);
        let handler = {
            get: function(target, prop) {
                if(prop === 'then') {
                    return undefined;
                }

                console.log(`View.${prop}`);
                return target[prop];
            }
        }

        let viewProxy = new Proxy(view, handler);
        return viewProxy;
    }

    // Before .50 AI version this may throw...
    fin.Platform.Layout.init({containerId});
});

(async function() {

    class ChannelIndicator extends HTMLElement {
        set viewName(value) {
            this.setAttribute('viewName', value);
        }
    
        get viewName() {
            return this.getAttribute('viewName');
        }
    
        set color(value) {
            if(value) {
                this.style.color = `${value}`;
                this.style.display = null;
            } else {
                this.style.color = null;
                this.style.display = 'none';
            }
        }

        get color() {
            return this.style.color;
        }
    
        connectedCallback() {
            this.connectTimeout = window.setTimeout(() => {
                this.connectTimeout = 0;
                this.connected = true;
                this.subscribe();
            }, 0);
        }
    
        disconnectedCallback() {
            if(this.connectTimeout) {
                clearTimeout(this.connectTimeout);
                this.connectTimeout = 0;
            }
    
            if(this.connected) {
                this.connected = false;
                this.unsubscribe();
            }
        }
    
        subscribe() {
            const indicator = this;
            const view = fin.View.wrapSync({ uuid: fin.me.identity.uuid, name: this.viewName });
    
            view.addListener('options-changed', this.subscription = ({ options }) => {
                options = fin.Extensions.upgradeOptions(options);
                console.log('setting color', options);
                let { channelId } = options;
                if(channelId) {
                    indicator.color = channelId;
                    indicator.innerHTML = '&#11044';
                }
            });
    
            view.getOptions()
                .then(options => ({ options }))
                .then(this.subscription)
                .catch();
        }
    
        unsubscribe() {
            if(this.subscription) {
                const view = fin.View.wrapSync({ uuid: fin.me.identity.uuid, name: this.viewName });
                view.removeListener('options-changed', this.subscription);
                delete this.subscription;
            }
        }
    }
    
    window.customElements.define('channel-indicator', ChannelIndicator);
        
    await new Promise(fin.desktop.main);
    
    let layoutContainer = document.getElementById('layout-container');
    
    console.log('subscribing to tab-created');
    layoutContainer.addEventListener('tab-created', ({ detail }) => {
        console.log('tab-created');
        let viewName = detail.name;
        let tabId = detail.tabSelector;
    
        let indicator = document.createElement('channel-indicator');
        indicator.className = 'channel-icon';
        indicator.addEventListener('click', colorIconClicked);
        indicator.viewName = viewName;
    
        let insertPoint = document.querySelector(`#${tabId} .lm_left`);
        insertPoint.insertAdjacentElement('afterend', indicator);
    });
    
    async function colorIconClicked({ target }) {
        let { color, viewName } =  target;

        fin.View.wrapSync({ 
            uuid: fin.me.uuid,
            name: viewName
        }).updateOptions({
            channelId: color === 'red' ? 'yellow' : 'red'
        }); 
    }
    
    })();

const lockedSvg = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzkyOTI5MiIgaWQ9Imljb24tMTE0LWxvY2siPjxwYXRoIGQ9Ik0xNiwyMS45MTQ2NDcyIEwxNiwyNC41MDg5OTQ4IEMxNiwyNC43ODAxNjk1IDE2LjIzMTkzMzYsMjUgMTYuNSwyNSBDMTYuNzc2MTQyNCwyNSAxNywyNC43NzIxMTk1IDE3LDI0LjUwODk5NDggTDE3LDIxLjkxNDY0NzIgQzE3LjU4MjU5NjIsMjEuNzA4NzI5IDE4LDIxLjE1MzEwOTUgMTgsMjAuNSBDMTgsMTkuNjcxNTcyOCAxNy4zMjg0MjcyLDE5IDE2LjUsMTkgQzE1LjY3MTU3MjgsMTkgMTUsMTkuNjcxNTcyOCAxNSwyMC41IEMxNSwyMS4xNTMxMDk1IDE1LjQxNzQwMzgsMjEuNzA4NzI5IDE2LDIxLjkxNDY0NzIgTDE2LDIxLjkxNDY0NzIgTDE2LDIxLjkxNDY0NzIgWiBNMTUsMjIuNTAwMTgzMSBMMTUsMjQuNDk4MzI0NCBDMTUsMjUuMzI3Njc2OSAxNS42NjU3OTcyLDI2IDE2LjUsMjYgQzE3LjMyODQyNzEsMjYgMTgsMjUuMzI4ODEwNiAxOCwyNC40OTgzMjQ0IEwxOCwyMi41MDAxODMxIEMxOC42MDcyMjM0LDIyLjA0NDA4IDE5LDIxLjMxNzkwOSAxOSwyMC41IEMxOSwxOS4xMTkyODgxIDE3Ljg4MDcxMTksMTggMTYuNSwxOCBDMTUuMTE5Mjg4MSwxOCAxNCwxOS4xMTkyODgxIDE0LDIwLjUgQzE0LDIxLjMxNzkwOSAxNC4zOTI3NzY2LDIyLjA0NDA4IDE1LDIyLjUwMDE4MzEgTDE1LDIyLjUwMDE4MzEgTDE1LDIyLjUwMDE4MzEgWiBNOSwxNC4wMDAwMTI1IEw5LDEwLjQ5OTIzNSBDOSw2LjM1NjcwNDg1IDEyLjM1Nzg2NDQsMyAxNi41LDMgQzIwLjYzMzcwNzIsMyAyNCw2LjM1NzUyMTg4IDI0LDEwLjQ5OTIzNSBMMjQsMTQuMDAwMDEyNSBDMjUuNjU5MTQ3MSwxNC4wMDQ3NDg4IDI3LDE1LjM1MDMxNzQgMjcsMTcuMDA5NDc3NiBMMjcsMjYuOTkwNTIyNCBDMjcsMjguNjYzMzY4OSAyNS42NTI5MTk3LDMwIDIzLjk5MTIxMiwzMCBMOS4wMDg3ODc5OSwzMCBDNy4zNDU1OTAxOSwzMCA2LDI4LjY1MjYxMSA2LDI2Ljk5MDUyMjQgTDYsMTcuMDA5NDc3NiBDNiwxNS4zMzk1ODEgNy4zNDIzMzM0OSwxNC4wMDQ3MTUyIDksMTQuMDAwMDEyNSBMOSwxNC4wMDAwMTI1IEw5LDE0LjAwMDAxMjUgWiBNMTAsMTQgTDEwLDEwLjQ5MzQyNjkgQzEwLDYuOTA4MTcxNzEgMTIuOTEwMTQ5MSw0IDE2LjUsNCBDMjAuMDgyNTQ2Miw0IDIzLDYuOTA3MjA2MjMgMjMsMTAuNDkzNDI2OSBMMjMsMTQgTDIyLDE0IEwyMiwxMC41MDkwNzMxIEMyMiw3LjQ2NjQ5NjAzIDE5LjUzMTM4NTMsNSAxNi41LDUgQzEzLjQ2MjQzMzksNSAxMSw3LjQ2MTQwMjg5IDExLDEwLjUwOTA3MzEgTDExLDE0IEwxMCwxNCBMMTAsMTQgWiBNMTIsMTQgTDEyLDEwLjUwMDg1MzcgQzEyLDguMDA5MjQ3OCAxNC4wMTQ3MTg2LDYgMTYuNSw2IEMxOC45ODAyMjQzLDYgMjEsOC4wMTUxMDA4MiAyMSwxMC41MDA4NTM3IEwyMSwxNCBMMTIsMTQgTDEyLDE0IEwxMiwxNCBaIE04Ljk5NzQyMTkxLDE1IEM3Ljg5NDI3NjI1LDE1IDcsMTUuODk3MDYwMSA3LDE3LjAwNTg1ODcgTDcsMjYuOTk0MTQxMyBDNywyOC4xMDE5NDY1IDcuODkwOTI1MzksMjkgOC45OTc0MjE5MSwyOSBMMjQuMDAyNTc4MSwyOSBDMjUuMTA1NzIzOCwyOSAyNiwyOC4xMDI5Mzk5IDI2LDI2Ljk5NDE0MTMgTDI2LDE3LjAwNTg1ODcgQzI2LDE1Ljg5ODA1MzUgMjUuMTA5MDc0NiwxNSAyNC4wMDI1NzgxLDE1IEw4Ljk5NzQyMTkxLDE1IEw4Ljk5NzQyMTkxLDE1IFoiIGlkPSJsb2NrIi8+PC9nPjwvZz48L3N2Zz4=';
const unlockedSvg = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzkyOTI5MiIgaWQ9Imljb24tMTE2LWxvY2stb3BlbiI+PHBhdGggZD0iTTI0LDkuNSBMMjQsOC40OTkyMzUgQzI0LDQuMzU3NTIxODggMjAuNjMzNzA3MiwxIDE2LjUsMSBDMTIuMzU3ODY0NCwxIDksNC4zNTY3MDQ4NSA5LDguNDk5MjM1IEw5LDE2LjAwMDAxMjUgTDksMTYuMDAwMDEyNSBDNy4zNDIzMzM0OSwxNi4wMDQ3MTUyIDYsMTcuMzM5NTgxIDYsMTkuMDA5NDc3NiBMNiwyOC45OTA1MjI0IEM2LDMwLjY1MjYxMSA3LjM0NTU5MDE5LDMyIDkuMDA4Nzg3OTksMzIgTDIzLjk5MTIxMiwzMiBDMjUuNjUyOTE5NywzMiAyNywzMC42NjMzNjg5IDI3LDI4Ljk5MDUyMjQgTDI3LDE5LjAwOTQ3NzYgQzI3LDE3LjM1MDMxNzQgMjUuNjU5MTQ3MSwxNi4wMDQ3NDg4IDI0LDE2IEwyMy40ODYzNTg2LDE2IEwxMi4wMjc0Nzc3LDE2IEMxMi4wMDkzMjIyLDE1LjgzNjAwNDEgMTIsMTUuNjY5MzUyNCAxMiwxNS41MDA1MjkxIEwxMiw4LjQ5OTQ3MDk1IEMxMiw2LjAxMDIxMDE5IDE0LjAxNDcxODYsNCAxNi41LDQgQzE4Ljk4MDIyNDMsNCAyMSw2LjAxNDQ4MTc2IDIxLDguNDk5NDcwOTUgTDIxLDkuNSBMMjEsMTIuNDk5ODM1MSBDMjEsMTMuMzI4MzUzMyAyMS42NjU3OTcyLDE0IDIyLjUsMTQgQzIzLjMyODQyNzEsMTQgMjQsMTMuMzI1Njc3OCAyNCwxMi40OTk4MzUxIEwyNCw5LjUgTDI0LDkuNSBMMjQsOS41IFogTTIzLDguNDkzNDI2ODYgQzIzLDQuOTA3MjA2MjMgMjAuMDgyNTQ2MiwyIDE2LjUsMiBDMTIuOTEwMTQ5MSwyIDEwLDQuOTA4MTcxNzEgMTAsOC40OTM0MjY4NiBMMTAsMTUuNTA2NTczMSBDMTAsMTUuNjcyNTc3NCAxMC4wMDYyNTEzLDE1LjgzNzEyNjYgMTAuMDE4NTMwNCwxNiBMMTEsMTYgTDExLDguNTA5MDczMDYgQzExLDUuNDYxNDAyODkgMTMuNDYyNDMzOSwzIDE2LjUsMyBDMTkuNTMxMzg1MywzIDIyLDUuNDY2NDk2MDMgMjIsOC41MDkwNzMwNiBMMjIsMTIuNTAyMjMzMyBDMjIsMTIuNzc3MTQyMyAyMi4yMzE5MzM2LDEzIDIyLjUsMTMgTDIyLjUsMTMgQzIyLjc3NjE0MjQsMTMgMjMsMTIuNzg0OTQyNiAyMywxMi41MDk1MjE1IEwyMyw5IEwyMyw4LjQ5MzQyNjg2IEwyMyw4LjQ5MzQyNjg2IFogTTE2LDIzLjkxNDY0NzIgTDE2LDI2LjUwODk5NDggQzE2LDI2Ljc4MDE2OTUgMTYuMjMxOTMzNiwyNyAxNi41LDI3IEMxNi43NzYxNDI0LDI3IDE3LDI2Ljc3MjExOTUgMTcsMjYuNTA4OTk0OCBMMTcsMjMuOTE0NjQ3MiBDMTcuNTgyNTk2MiwyMy43MDg3MjkgMTgsMjMuMTUzMTA5NSAxOCwyMi41IEMxOCwyMS42NzE1NzI4IDE3LjMyODQyNzIsMjEgMTYuNSwyMSBDMTUuNjcxNTcyOCwyMSAxNSwyMS42NzE1NzI4IDE1LDIyLjUgQzE1LDIzLjE1MzEwOTUgMTUuNDE3NDAzOCwyMy43MDg3MjkgMTYsMjMuOTE0NjQ3MiBMMTYsMjMuOTE0NjQ3MiBMMTYsMjMuOTE0NjQ3MiBaIE0xNSwyNC41MDAxODMxIEwxNSwyNi40OTgzMjQ0IEMxNSwyNy4zMjc2NzY5IDE1LjY2NTc5NzIsMjggMTYuNSwyOCBDMTcuMzI4NDI3MSwyOCAxOCwyNy4zMjg4MTA2IDE4LDI2LjQ5ODMyNDQgTDE4LDI0LjUwMDE4MzEgQzE4LjYwNzIyMzQsMjQuMDQ0MDggMTksMjMuMzE3OTA5IDE5LDIyLjUgQzE5LDIxLjExOTI4ODEgMTcuODgwNzExOSwyMCAxNi41LDIwIEMxNS4xMTkyODgxLDIwIDE0LDIxLjExOTI4ODEgMTQsMjIuNSBDMTQsMjMuMzE3OTA5IDE0LjM5Mjc3NjYsMjQuMDQ0MDggMTUsMjQuNTAwMTgzMSBMMTUsMjQuNTAwMTgzMSBMMTUsMjQuNTAwMTgzMSBaIE04Ljk5NzQyMTkxLDE3IEM3Ljg5NDI3NjI1LDE3IDcsMTcuODk3MDYwMSA3LDE5LjAwNTg1ODcgTDcsMjguOTk0MTQxMyBDNywzMC4xMDE5NDY1IDcuODkwOTI1MzksMzEgOC45OTc0MjE5MSwzMSBMMjQuMDAyNTc4MSwzMSBDMjUuMTA1NzIzOCwzMSAyNiwzMC4xMDI5Mzk5IDI2LDI4Ljk5NDE0MTMgTDI2LDE5LjAwNTg1ODcgQzI2LDE3Ljg5ODA1MzUgMjUuMTA5MDc0NiwxNyAyNC4wMDI1NzgxLDE3IEw4Ljk5NzQyMTkxLDE3IEw4Ljk5NzQyMTkxLDE3IFoiIGlkPSItb2NrLW9wZW4iLz48L2c+PC9nPjwvc3ZnPg==';
const chartUrl = 'https://cdn.openfin.co/embed-web/chart.html';

//Our Left Menu element
class LeftMenu extends HTMLElement {
    constructor() {
        super();
        this.render = this.render.bind(this);
        this.createChart = this.createChart.bind(this);
        this.saveSnapshot = this.saveSnapshot.bind(this);
        this.restoreSnapshot = this.restoreSnapshot.bind(this);
        this.toGrid = this.toGrid.bind(this);
        this.toTabbed = this.toTabbed.bind(this);
        this.toRows = this.toRows.bind(this);
        this.newWindow = this.newDefaultWindow.bind(this);
        this.nonLayoutWindow = this.nonLayoutWindow.bind(this);
        this.saveWindowLayout = this.saveWindowLayout.bind(this);
        this.restoreWindowLayout = this.restoreWindowLayout.bind(this);
        this.applySnapshot = this.applySnapshot.bind(this);

        this.render();
    }

     async render() {
        const menuItems = html`
        <div class="left-menu">
            <ul>
                <li><button @click=${() => this.createChart().catch(console.error)}>New Chart</button></li>
                <li><button @click=${() => this.newDefaultWindow().catch(console.error)}>New Chart Window</button></li>
                <li><button @click=${() => this.nonLayoutWindow().catch(console.error)}>New Window</button></li>
                <li><button class="new" @click=${() => this.nativeSingleWindow().catch(console.error)}>Native Single Window</button></li>
                <li><button class="new" @click=${() => this.nativeMultiWindow().catch(console.error)}>Native Multi Window</button></li>
                <li><button class="secret" @click=${() => this.nativeView().catch(console.error)}>Native View</button></li>
                <li><button class="secret" @click=${() => this.nativeViewWindow().catch(console.error)}>Native View Window</button></li>
                <li><button @click=${() => this.saveSnapshot().catch(console.error)}>Save Platform Snapshot</button></li>
                <li><button @click=${() => this.restoreSnapshot().catch(console.error)}>Restore Platform Snapshot</button></li>
                <li><button @click=${() => this.applySnapshot().catch(console.error)}>Apply Platform Snapshot</button></li>
            <ul>
        </div>`;
        return render(menuItems, this);
    }

    async createChart() {
        //we want to add a chart to the current window.
        return fin.Platform.getCurrentSync().createView({
            url: chartUrl
        }, fin.me.identity);
    }

    async saveWindowLayout() {
        const winLayoutConfig = await fin.Platform.Layout.getCurrentSync().getConfig();
        localStorage.setItem(fin.me.identity.name, JSON.stringify(winLayoutConfig));
    }

    async restoreWindowLayout() {
        const storedWinLayout = localStorage.getItem(fin.me.identity.name);
        if (storedWinLayout) {
            return fin.Platform.Layout.getCurrentSync().replace(JSON.parse(storedWinLayout));
        } else {
            throw new Error("No snapshot found in localstorage");
        }
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

    async newDefaultWindow() {
        //we want to add a chart in a new window.
        return fin.Platform.getCurrentSync().createView({
            url: chartUrl
        }, undefined);
    }

    async nonLayoutWindow() {
        return fin.Platform.getCurrentSync().applySnapshot({
            windows: [{
                defaultWidth: 600,
                defaultHeight: 600,
                defaultLeft: 200,
                defaultTop: 200,
                saveWindowState: false,
                url: chartUrl,
                contextMenu: true
            }]
        });
    }

    async nativeSingleWindow() {
        return fin.Platform.getCurrentSync().applySnapshot({
            windows: [{
                defaultWidth: 500,
                defaultHeight: 400,
                defaultLeft: 120,
                defaultTop: 120,
                className: 'OpenFinPlatformApp.MainForm',
                mainWindow: true,
                startInfo: {
                    target: 'C:/Users/nicho/source/repos/nwi/OpenFinPlatformApp/bin/Debug/openfin-platform-app.exe'
                }
            }]
        });
    }

    async nativeMultiWindow() {
        return fin.Platform.getCurrentSync().applySnapshot({
            windows: [{
                defaultWidth: 460,
                defaultHeight: 200,
                defaultLeft: 240,
                defaultTop: 240,
                className: 'OpenFinPlatformApp.MainForm',
                startInfo: {
                    uuid: 'multi-window-app',
                    target: 'C:/Users/nicho/source/repos/nwi/OpenFinPlatformApp/bin/Debug/openfin-platform-app.exe',
                    lifetime: 'application'
                }
            }]
        });
    }

    async nativeView() {
        //we want to add a chart in a new window.
        return fin.Platform.getCurrentSync().createView({
            className: 'OpenFinPlatformApp.MainForm',
            startInfo: {
                uuid: 'multi-window-app',
                target: 'C:/Users/nicho/source/repos/nwi/OpenFinPlatformApp/bin/Debug/openfin-platform-app.exe',
                lifetime: 'application'
            }
        }, fin.me.identity);
    }

    async nativeViewWindow() {
        //we want to add a chart in a new window.
        return fin.Platform.getCurrentSync().createView({
            className: 'OpenFinPlatformApp.MainForm',
            startInfo: {
                uuid: 'multi-window-app',
                target: 'C:/Users/nicho/source/repos/nwi/OpenFinPlatformApp/bin/Debug/openfin-platform-app.exe',
                lifetime: 'application'
            }
        }, undefined);
    }

    async saveSnapshot() {
        const snapshot = await fin.Platform.getCurrentSync().getSnapshot();
        localStorage.setItem('snapShot', JSON.stringify(snapshot));
    }

    async restoreSnapshot() {
        const storedSnapshot = localStorage.getItem('snapShot');
        if (storedSnapshot) {
            return fin.Platform.getCurrentSync().applySnapshot(JSON.parse(storedSnapshot), {
                closeExistingWindows: true
            });
        } else {
            throw new Error("No snapshot found in localstorage");
        }
    }

    async applySnapshot() {
        const storedSnapshot = localStorage.getItem('snapShot');
        if (storedSnapshot) {
            return fin.Platform.getCurrentSync().applySnapshot(JSON.parse(storedSnapshot), {
                closeExistingWindows: false
            });
        } else {
            throw new Error("No snapshot found in localstorage");
        }
    }
}

//Our Title bar element
class TitleBar extends HTMLElement {
    constructor() {
        super();
        this.render = this.render.bind(this);

        this.render();
        this.maxOrRestore = this.maxOrRestore.bind(this);
    }

    async render() {
        const titleBar = html`
        <div id="title-bar">
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                    <div class="button" id="lock-button" @click=${this.toggleLockedLayout}><img></div>
                    <div class="button" id="minimize-button" @click=${() => fin.me.minimize().catch(console.error)}></div>
                    <div class="button" id="expand-button" @click=${() => this.maxOrRestore().catch(console.error)}></div>
                    <div class="button" id="close-button" @click=${() => fin.me.close().catch(console.error)}></div>
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

    async toggleLockedLayout () {
        const oldLayout = await fin.Platform.Layout.getCurrentSync().getConfig();
        const { settings, dimensions } = oldLayout;
        if(settings.hasHeaders && settings.reorderEnabled) {
            fin.Platform.Layout.getCurrentSync().replace({
                ...oldLayout,
                settings: {
                    ...settings,
                    hasHeaders: false,
                    reorderEnabled: false,
                }
            });
        } else {
            fin.Platform.Layout.getCurrentSync().replace({
                ...oldLayout,
                settings: {
                    ...settings,
                    hasHeaders: true,
                    reorderEnabled: true,
                },
                dimensions: {
                    ...dimensions,
                    headerHeight: 20
                }
            });
        }
    };
}

customElements.define('left-menu', LeftMenu);
customElements.define('title-bar', TitleBar);
