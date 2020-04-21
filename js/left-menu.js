import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { componentNameGenerator } from './component-name-generator.js';

window.addEventListener('DOMContentLoaded', () => {
    const containerId = 'layout-container';
    try {
        fin.Platform.Layout.init({containerId});
    } catch(e) {
        // don't throw me - after .50/.51 it won't error anymore
    }
});

const chartUrl = 'https://cdn.openfin.co/embed-web/chart.html';
const contextViewUrl = document.location.host + '/platform-view-context.html';

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
                <li><button @click=${() => this.createContextView().catch(console.error)}>New Context View</button></li>
                <li><button @click=${() => this.saveWindowLayout().catch(console.error)}>Save Layout</button></li>
                <li><button @click=${() => this.restoreWindowLayout().catch(console.error)}>Restore Layout</button></li>
                <li><button @click=${() => this.toGrid().catch(console.error)}>Grid</button></li>
                <li><button @click=${() => this.toTabbed().catch(console.error)}>Tab</button></li>
                <li><button @click=${() => this.toRows().catch(console.error)}>Rows</button></li>
                <li><button @click=${() => this.toColumns().catch(console.error)}>Columns</button></li>
                <li><button @click=${() => this.newDefaultWindow().catch(console.error)}>New Chart Window</button></li>
                <li><button @click=${() => this.newContextWindow().catch(console.error)}>New Context Window</button></li>
                <li><button @click=${() => this.nonLayoutWindow().catch(console.error)}>New Window</button></li>
                <li><button @click=${() => this.saveSnapshot().catch(console.error)}>Save Platform Snapshot</button></li>
                <li><button @click=${() => this.restoreSnapshot().catch(console.error)}>Restore Platform Snapshot</button></li>
                <li><button @click=${() => this.applySnapshot().catch(console.error)}>Apply Platform Snapshot</button></li>
            <ul>
        </div>`;
        return render(menuItems, this);
    }

    async createContextView() {
        //we want to add a context view to the current window.
        return fin.Platform.getCurrentSync().createView({
            url: contextViewUrl,
            name: componentNameGenerator()
        }, fin.me.identity);
    }

    async createChart() {
        //we want to add a chart to the current window.
        return fin.Platform.getCurrentSync().createView({
            url: chartUrl
        }, fin.me.identity);
    }

    async saveWindowLayout() {
        const winLayoutConfig = await fin.Platform.Layout.getCurrentSync().getConfig();
        sessionStorage.setItem(fin.me.identity.name, JSON.stringify(winLayoutConfig));
    }

    async restoreWindowLayout() {
        const storedWinLayout = sessionStorage.getItem(fin.me.identity.name);
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

    async toColumns() {
        await fin.Platform.Layout.getCurrentSync().applyPreset({
            presetType: 'columns'
        });
    }

    async newDefaultWindow() {
        //we want to add a chart in a new window.
        return fin.Platform.getCurrentSync().createView({
            url: chartUrl
        }, undefined);
    }

    async newContextWindow() {
        //we want to add a context view in a new window.
        return fin.Platform.getCurrentSync().createView({
            url: contextViewUrl
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
            // this will prevent the reload event
            await fin.Window.getCurrentSync().removeAllListeners('close-requested');

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

customElements.define('left-menu', LeftMenu);
