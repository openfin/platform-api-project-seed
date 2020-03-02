import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

//TODO: write this as a util somewhere.
function componentNameRandomizer() {
    return `component_A${Date.now() + Math.floor(Math.random() * 10000)}`;
}

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

        this.render();
    }

     async render() {
        const menuItems = html`
        <div class="left-menu">
            <ul>
                <li><button @click=${() => this.createChart().catch(console.error)}>New Chart</button></li>
                <li><button @click=${() => this.saveWindowLayout().catch(console.error)}>Save Layout</button></li>
                <li><button @click=${() => this.restoreWindowLayout().catch(console.error)}>Restore Layout</button></li>
                <li><button @click=${() => this.toGrid().catch(console.error)}>Grid</button></li>
                <li><button @click=${() => this.toTabbed().catch(console.error)}>Tab</button></li>
                <li><button @click=${() => this.toRows().catch(console.error)}>Rows</button></li>
                <li><button @click=${() => this.newDefaultWindow().catch(console.error)}>New Chart Window</button></li>
                <li><button @click=${() => this.nonLayoutWindow().catch(console.error)}>New Window</button></li>
                <li><button @click=${() => this.saveSnapshot().catch(console.error)}>Save Platform Snapshot</button></li>
                <li><button @click=${() => this.restoreSnapshot().catch(console.error)}>Restore Platform Snapshot</button></li>
            <ul>
        </div>`;
        return render(menuItems, this);
     }

    async createChart() {
        //we want to add a chart to the current window.
        return fin.Platform.getCurrentSync().createView({
            url: chartUrl,
            name : componentNameRandomizer()
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
            url: chartUrl,
            name : componentNameRandomizer()
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
}

customElements.define('left-menu', LeftMenu);
customElements.define('title-bar', TitleBar);
