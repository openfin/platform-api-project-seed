import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { getTemplates, getTemplateByName, onStoreUpdate } from './template-store.js';
import { CONTAINER_ID } from './platform-window.js';

const CHART_URL = 'https://cdn.openfin.co/embed-web/chart.html';
const LAYOUT_STORE_KEY  = 'LayoutForm';
const SNAPSHOT_STORE_KEY = 'SnapshotForm';


//Our Left Menu element
class LeftMenu extends HTMLElement {
    constructor() {
        super();
        this.onclick = this.clickHandler;

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
            },
            {
                url: window.location.href.replace('platform-window', 'color-view'),
                printName: 'Colors',
                processAffinity: 'cv_1'
            },
            {
                url: `https://cdn.openfin.co/docs/javascript/${fin.desktop.getVersion()}`,
                printName: "Documentation",
                processAffinity: 'ps_1'
            }
        ];

        this.snapshotForm = document.querySelector('snapshot-form');
        this.layoutForm = document.querySelector('layout-form');
        this.layoutContainer = document.querySelector(`#${CONTAINER_ID}`);

        this.render();

        //Whenever the store updates we will want to render any new elements.
        onStoreUpdate(() => { this.render(); });
    }

    clickHandler = (e) => {
        const target = e.target;

        if (target.className === 'snapshot-button' || target.className === 'layout-button') {
            if (!this.layoutContainer.classList.contains('hidden')) {
                this.layoutContainer.classList.toggle('hidden');
            }
        }

        if (target.className === 'snapshot-button') {
            this.snapshotForm.showElement();
            this.layoutForm.hideElement();
        } else if (target.className === 'layout-button') {
            this.layoutForm.showElement();
            this.snapshotForm.hideElement();
        } else {
            this.layoutForm.hideElement();
            this.snapshotForm.hideElement();

            if (this.layoutContainer.classList.contains('hidden')) {
                this.layoutContainer.classList.toggle('hidden');
            }
        }
    }

    render = async () => {
        const layoutTemplates = getTemplates(LAYOUT_STORE_KEY);
        const snapshotTemplates = getTemplates(SNAPSHOT_STORE_KEY);
        const menuItems = html`
        <span>Applications</span>
        <ul>
            ${this.appList.map((item) => html`<li>
                  <button @click=${() => this.addView(item.printName)}>${item.printName}</button>
              </li>`)}

        </ul>
        <span>Windows</span>
        <ul>
            <li><button @click=${() => this.layoutWindow().catch(console.error)}>Platform Window</button></li>
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
            <li><button @click=${() => this.share()}>Share</button></li>
        </ul>`;
        return render(menuItems, this);
    }

    applySnapshotFromTemplate = async (templateName) => {
        const template = getTemplateByName(SNAPSHOT_STORE_KEY, templateName);
        return fin.Platform.getCurrentSync().applySnapshot(template.snapshot, {
            closeExistingWindows: template.close
        });

    }

    replaceLayoutFromTemplate = async (templateName) => {
        const templates = getTemplates(LAYOUT_STORE_KEY);
        const templateToUse = templates.find(i => i.name === templateName);
        fin.Platform.Layout.getCurrentSync().replace(templateToUse.layout);
    }

    addView = async (printName) => {
        const viewOptions = this.appList.find(i => i.printName === printName);
        return fin.Platform.getCurrentSync().createView(viewOptions, fin.me.identity);
    }

    toGrid = async () => {
        await fin.Platform.Layout.getCurrentSync().applyPreset({
            presetType: 'grid'
        });
    }

    toTabbed = async () => {
        await fin.Platform.Layout.getCurrentSync().applyPreset({
            presetType: 'tabs'
        });
    }
    toRows = async () => {
        await fin.Platform.Layout.getCurrentSync().applyPreset({
            presetType: 'rows'
        });
    }

    cloneWindow = async () => {
        const bounds = await fin.me.getBounds();
        const layout = await fin.Platform.Layout.getCurrentSync().getConfig();
        const customContext = await fin.Platform.getCurrentSync().getWindowContext();
        const snapshot = {
            windows: [
                {
                    defaultWidth: bounds.width,
                    defaultHeight: bounds.height,
                    layout,
                    //getWindowContext actually returns the customContext option.
                    customContext
                }
            ]
        };

        return fin.Platform.getCurrentSync().applySnapshot(snapshot);
    }

    nonLayoutWindow = async () => {
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

    layoutWindow = async () => {

        const viewOptions = {
            url: CHART_URL
        };
        return fin.Platform.getCurrentSync().createView(viewOptions);
    }

    share = async () => {
        const { windows } = await fin.Platform.getCurrentSync().getSnapshot();
        const contentConfig = {snapshot: { windows } };
        const res = await fetch('https://jsonblob.com/api/jsonBlob', {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(contentConfig), // data can be `string` or {object}!
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const contentUrl = res.headers.get('Location');
        const { manifestUrl } = await fin.Application.getCurrentSync().getInfo();

        const startUrl = `https://openfin.github.io/start/?manifest=${encodeURIComponent(`${manifestUrl}?$$appManifestUrl=${contentUrl}`)}`;

        fin.System.openUrlWithBrowser(startUrl);
    }
}
customElements.define('left-menu', LeftMenu);
