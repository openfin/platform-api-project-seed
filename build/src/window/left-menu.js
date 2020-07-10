var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { html, render } from 'lit-html';
import { getTemplates, getTemplateByName, onStoreUpdate } from './template-store.js';
import { CONTAINER_ID } from './platform-window.js';
const CHART_URL = 'https://cdn.openfin.co/embed-web/chart.html';
const LAYOUT_STORE_KEY = 'LayoutForm';
const SNAPSHOT_STORE_KEY = 'SnapshotForm';
//Our Left Menu element
class LeftMenu extends HTMLElement {
    constructor() {
        super();
        this.clickHandler = (e) => {
            const target = e.target;
            if (target.className === 'snapshot-button' || target.className === 'layout-button') {
                if (!this.layoutContainer.classList.contains('hidden')) {
                    this.layoutContainer.classList.toggle('hidden');
                }
            }
            if (target.className === 'snapshot-button') {
                this.snapshotForm.showElement();
                this.layoutForm.hideElement();
            }
            else if (target.className === 'layout-button') {
                this.layoutForm.showElement();
                this.snapshotForm.hideElement();
            }
            else {
                this.layoutForm.hideElement();
                this.snapshotForm.hideElement();
                if (this.layoutContainer.classList.contains('hidden')) {
                    this.layoutContainer.classList.toggle('hidden');
                }
            }
        };
        this.render = () => __awaiter(this, void 0, void 0, function* () {
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
        });
        this.applySnapshotFromTemplate = (templateName) => __awaiter(this, void 0, void 0, function* () {
            const template = getTemplateByName(SNAPSHOT_STORE_KEY, templateName);
            return fin.Platform.getCurrentSync().applySnapshot(template.snapshot, {
                closeExistingWindows: template.close
            });
        });
        this.replaceLayoutFromTemplate = (templateName) => __awaiter(this, void 0, void 0, function* () {
            const templates = getTemplates(LAYOUT_STORE_KEY);
            const templateToUse = templates.find(i => i.name === templateName);
            fin.Platform.Layout.getCurrentSync().replace(templateToUse.layout);
        });
        this.addView = (printName) => __awaiter(this, void 0, void 0, function* () {
            const viewOptions = this.appList.find(i => i.printName === printName);
            return fin.Platform.getCurrentSync().createView(viewOptions, fin.me.identity);
        });
        this.toGrid = () => __awaiter(this, void 0, void 0, function* () {
            yield fin.Platform.Layout.getCurrentSync().applyPreset({
                presetType: 'grid'
            });
        });
        this.toTabbed = () => __awaiter(this, void 0, void 0, function* () {
            yield fin.Platform.Layout.getCurrentSync().applyPreset({
                presetType: 'tabs'
            });
        });
        this.toRows = () => __awaiter(this, void 0, void 0, function* () {
            yield fin.Platform.Layout.getCurrentSync().applyPreset({
                presetType: 'rows'
            });
        });
        this.cloneWindow = () => __awaiter(this, void 0, void 0, function* () {
            const bounds = yield fin.me.getBounds();
            const layout = yield fin.Platform.Layout.getCurrentSync().getConfig();
            const customContext = yield fin.Platform.getCurrentSync().getWindowContext();
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
        });
        this.nonLayoutWindow = () => __awaiter(this, void 0, void 0, function* () {
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
        });
        this.layoutWindow = () => __awaiter(this, void 0, void 0, function* () {
            const viewOptions = {
                url: CHART_URL
            };
            return fin.Platform.getCurrentSync().createView(viewOptions);
        });
        this.share = () => __awaiter(this, void 0, void 0, function* () {
            const { windows } = yield fin.Platform.getCurrentSync().getSnapshot();
            const contentConfig = { snapshot: { windows } };
            const res = yield fetch('https://jsonblob.com/api/jsonBlob', {
                method: 'POST',
                body: JSON.stringify(contentConfig),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const contentUrl = res.headers.get('Location');
            const { manifestUrl } = yield fin.Application.getCurrentSync().getInfo();
            const startUrl = `https://openfin.github.io/start/?manifest=${encodeURIComponent(`${manifestUrl}?$$appManifestUrl=${contentUrl}`)}`;
            fin.System.openUrlWithBrowser(startUrl);
        });
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
}
customElements.define('left-menu', LeftMenu);
