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
                <li><button @click=${() => this.toColumns().catch(console.error)}>Columns</button></li>
                <li><button @click=${() => this.addChartToColumn().catch(console.error)}>Add Chart To Column</button></li>
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

    async addChartToColumn() {
        //we want to add a chart to the current window.
        const layoutApi = await fin.Platform.Layout.getCurrentSync();
        const winLayoutConfig = await layoutApi.getConfig();
        const firstLevelColumnIndex = this.getIndexFor("column", winLayoutConfig.content);
        let insertedChart = false;
        let newChart = {"type":"stack","isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"content":[{"type":"component","componentName":"view","componentState":{"name":"component_A1","processAffinity":"ps_1","url":"https://cdn.openfin.co/embed-web/chart.html","componentName":"view","uuid":"platform_customization_local","initialUrl":"https://cdn.openfin.co/embed-web/chart.html"},"isClosable":true,"reorderEnabled":true,"title":"OpenFin Template"}]};
        // this example only search
        if(firstLevelColumnIndex !== -1) {
            // we have the first column add it to the column
            winLayoutConfig.content[firstLevelColumnIndex].content = this.insertColumnItem(newChart, winLayoutConfig.content[firstLevelColumnIndex].content);
            insertedChart = true;
        } else {
            // search for a column the next level down
            for(let i = 0; i < winLayoutConfig.content.length; i++) {
                let entry = winLayoutConfig.content[i];
                let secondLevelIndex = this.getIndexFor("column", entry.content);
                if(secondLevelIndex !== -1) {
                    entry.content[secondLevelIndex].content = this.insertColumnItem(newChart, entry.content[secondLevelIndex].content);
                    insertedChart = true;
                    break;
                }
            }
        }

        if(insertedChart) {
            return layoutApi.replace(winLayoutConfig);
        }
    }

    getIndexFor(type, content) {
        return content.findIndex(entry => entry.type === type);
    }

    insertColumnItem(item, arrayOfItems) {
        let newHeight = 100 / (arrayOfItems.length + 1);
        let newContent = arrayOfItems.flatMap(entry => {
            entry.height = newHeight;
            return entry;
        });
        item.height = newHeight;
        newContent.push(item);
        return newContent;
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

    async toColumns() {
        await fin.Platform.Layout.getCurrentSync().applyPreset({
            presetType: 'columns'
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
