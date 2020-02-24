import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

class ViewForm extends HTMLElement {
    constructor() {
        super();
        this.render = this.render.bind(this);
        this.createPlatformWindow = this.createPlatformWindow.bind(this);
        this.generateDefaultConfig = this.generateDefaultConfig.bind(this);
        this.addToView = this.addToView.bind(this);
        this.saveSnapshot = this.saveSnapshot.bind(this);
        this.applyStoredSnapshot = this.applyStoredSnapshot.bind(this);
        this.launchGenerator = this.launchGenerator.bind(this);
        this.platform = fin.Platform.getCurrentSync();
        this.componentNameRandomizer = this.componentNameRandomizer.bind(this);

        //update list of windows.
        fin.Application.getCurrentSync().on('window-initialized', this.render);
        fin.Application.getCurrentSync().on('window-closed', this.render);
        this.render();
    }

    //We use this function to ensure we can launch multiple components from the same "snapshot"
    componentNameRandomizer() {
        return `component_A${Date.now() + Math.floor(Math.random() * 10000)}`;
    }

    async render() {

        //Hard coded code here, caution:
        const app = fin.Application.getCurrentSync();
        const wins = await app.getChildWindows();

        this.selectedWindow = wins[0].identity.name;
        const vForm = html`
        <div>
            <h4>
            ${ 'fin' in window
                ? html`OpenFin version: ${await fin.System.getVersion()}`
                : 'The fin API is not available - you are probably running in a browser.'
            }
            </h4>
        </div>
        <div>
            <fieldset>
                <legend>Create a new Platform Window</legend>
                <legend>Layout</legend>
                <select id='layout'>
                    <option value="grid">Grid</option>
                    <option value="tabbed">Tabbed</option>
                    <option value="fixed">Fixed</option>
                </select>
                <button @click=${() => this.createPlatformWindow().catch(console.error)}>Create</button> <br>
            </fieldset>
            <fieldset>
                <legend>Add view to window</legend>
               <input
                    type="text"
                    id="url-to-add"
                    size="50"
                    value="https://cdn.openfin.co/embed-web/chart.html"
                /> <br>
                <select id="selected-window">
                    ${wins.map((win) => html`<option value="${win.identity.name}">${win.identity.name}</option>`)}
                </select>
                <button @click=${() => this.addToView().catch(console.error)}>Add</button> <br>
             </fieldset>
          <fieldset>
             <legend>SnapShots</legend>
                <button @click=${() => this.saveSnapshot().catch(console.error)}>Save snapshot</button> <br>
                <button @click=${(e) => this.applyStoredSnapshot(e).catch(console.error)}>Apply snapshot</button> <br>
                <button @click=${(e) => this.applyStoredSnapshot(e, true).catch(console.error)}>Close Apps and apply snapshot</button> <br>
          </fieldset>
          <fieldset>
             <legend>Platform Config Generator</legend>
              <button @click=${() => this.launchGenerator().catch(console.error)}>Launch Platform Config Generator</button> <br>
          </fieldset>
        </div>`;
        render(vForm, this);
    }

    async addToView() {
        const urlToAdd = this.querySelector('#url-to-add').value;
        const selectedWindow = this.querySelector('#selected-window').value;
        const { identity: { uuid } } = fin.me;
        const target = { uuid, name: selectedWindow };
        return this.platform.createView({
            name: this.componentNameRandomizer(),
            url: urlToAdd
        }, target);
    }

    async createPlatformWindow() {
        return this.platform.createWindow({
            layout: this.generateDefaultConfig(
                'https://cryptowat.ch/markets/kraken/btc/usd',
                'https://cdn.openfin.co/embed-web/chart.html',
                'https://www.tradingview.com/chart/?symbol=NASDAQ:AAPL')
        });
    }

    //we just save the snapshot to localstorage
    async saveSnapshot() {
        const snapshot = await this.platform.getSnapshot();
        localStorage.setItem('snapShot', JSON.stringify(snapshot));
    }

    //apply the snapshot from localstorage
    async applyStoredSnapshot(e, close) {
        const storedSnapshot = localStorage.getItem('snapShot');
        if (storedSnapshot) {
            return this.platform.applySnapshot(JSON.parse(storedSnapshot), {
                closeExistingWindows: close
            });
        } else {
            throw new Error("No snapshot found in localstorage");
        }
    }

    //Open the generator in the default browser
    async launchGenerator() {
        return fin.System.openUrlWithBrowser('https://openfin.github.io/golden-prototype/config-gen');
    }

    generateDefaultConfig(url1, url2, url3) {
        const { identity: { uuid } } = fin.me;
        const selectedLayout = this.querySelector('#layout').value;

        const grid = {
            settings: {
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: false,
                constrainDragToContainer: false
            },
            content: [{
                type: 'row',
                content: [{
                    type: 'stack',
                    content: [{
                        type: 'component',
                        componentName: 'view',
                        componentState: {
                            name: this.componentNameRandomizer(),
                            url: url1
                        }
                    }]
                }, {
                    type: 'column',
                    content: [{
                        type: 'component',
                        componentName: 'view',
                        componentState: {
                            name: this.componentNameRandomizer(),
                            url: url2
                        }
                    }, {
                        type: 'component',
                        componentName: 'view',
                        componentState: {
                            name: this.componentNameRandomizer(),
                            url: url3
                        }
                    }]
                }]
            }]
        };

        const tabbed = {
            settings: {
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: false,
                constrainDragToContainer: false
            },
            content: [{
                type: 'stack',
                content: [{
                    type: 'component',
                    componentName: 'view',
                    componentState: {
                        name: this.componentNameRandomizer(),
                        url: url1
                    }
                }, {
                    type: 'component',
                    componentName: 'view',
                    componentState: {
                        name: this.componentNameRandomizer(),
                        url: url2
                    }
                }, {
                    type: 'component',
                    componentName: 'view',
                    componentState: {

                        name: this.componentNameRandomizer(),
                        url: url3
                    }
                }]
            }]
        };

        const fixed = {
            settings: {
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: false,
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false
            },
            dimensions: {
                borderWidth: 0,
                headerHeight: 0
            },
            content: [{
                type: 'row',
                content: [{
                    type: 'stack',
                    content: [{
                        type: 'component',
                        componentName: 'view',
                        componentState: {
                            name: this.componentNameRandomizer(),
                            url: url1
                        }
                    }]
                }, {
                    type: 'column',
                    content: [{
                        type: 'component',
                        componentName: 'view',
                        componentState: {
                            name: this.componentNameRandomizer(),
                            url: url2
                        }
                    }, {
                        type: 'component',
                        componentName: 'view',
                        componentState: {
                            name: this.componentNameRandomizer(),
                            url: url3
                        }
                    }]
                }]
            }]
        };

        switch (selectedLayout) {
            case 'grid':
                return grid;
                break;
            case 'tabbed':
                return tabbed;
                break;
            case 'fixed':
                return fixed;
                break;
            default:
                break;
        }
    }
}

customElements.define('view-form', ViewForm);
