import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

//Our Title bar element
class TitleBar extends HTMLElement {
    constructor() {
        super();
        this.LIGHT_THEME = 'light-theme';
        this.DARK_THEME = 'dark';

        this.render();
        fin.Platform.getCurrentSync().getWindowContext().then(initialContext => {
            if (initialContext && initialContext.theme) {
                this.setTheme(initialContext.theme);
            }
        });

        fin.Platform.getCurrentSync().on('window-context-changed', async (evt) => {
            const context = await fin.Platform.getCurrentSync().getWindowContext();
            //we only want to react to events that include themes
            if (evt.context.theme && evt.context.theme !== context.theme) {
                this.setTheme(evt.context.theme);
            }
        });

        // fin.me.on('layout-ready', async () => {
        //     // Whenever a new layout is ready on this window (on init, replace, or applyPreset)
        //     const { settings } = await fin.Platform.Layout.getCurrentSync().getConfig();
        //     // determine whether it is locked and update the icon
        //     if(settings.hasHeaders && settings.reorderEnabled) {
        //         document.getElementById('lock-button').classList.remove('layout-locked');
        //     } else {
        //         document.getElementById('lock-button').classList.add('layout-locked');
        //     }
        // });
    }

    render = async () => {
        const titleBar = html`
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                    <div class="button" title="Create Window" id="create-window-button" @click=${this.createWindow}>1</div>
                    <div class="button" title="Hide Window" id="hide-window" @click=${this.hideWindow}>2</div>
                    <div class="button" title="Change Background to Red" id="red-btn" @click=${this.changeToRed}>3A</div>
                    <div class="button" title="Change Background to Blue" id="blue-btn" @click=${this.changeToBlue}>3B</div>
                    <div class="button" title="Show Window" id="show-window" @click=${this.showWindow}>4</div>

                    <div class="button" title="Minimize Window" id="minimize-button" @click=${() => fin.me.minimize().catch(console.error)}></div>
                    <div class="button" title="Maximize Window" id="expand-button" @click=${() => this.maxOrRestore().catch(console.error)}></div>
                    <div class="button" title="Close Window" id="close-button" @click=${() => fin.me.close().catch(console.error)}></div>
                </div>`;
        return render(titleBar, this);
    }

    maxOrRestore = async () => {
        if (await fin.me.getState() === 'normal') {
            return await fin.me.maximize();
        }

        return fin.me.restore();
    }

    toggleLockedLayout = async () => {
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

    toggleTheme = async () => {
        let themeName = this.DARK_THEME;
        if (!document.documentElement.classList.contains(this.LIGHT_THEME)) {
            themeName = this.LIGHT_THEME;
        }
        this.setTheme(themeName);
    }

    createWindow = async () => {
        const winOption = {
            name: 'test',
            defaultWidth: 300,
            defaultHeight: 300,
            url: 'https://cdn.openfin.co/docs/javascript/stable/tutorial-Window.create.html',
            frame: true,
            autoShow: true,
            backgroundThrottling: false,
        };
        await fin.Window.create(winOption);
    }
    
        hideWindow= async () => {
            const testWin = await fin.Window.wrap({uuid: 'platform_customization_local', name: 'test'});
            await testWin.hide();
        }

    showWindow = async () => {
        const testWin = await fin.Window.wrap({uuid: 'platform_customization_local', name: 'test'});
        await testWin.show();
    }

    changeToRed = async () => {
        const testWin = await fin.Window.wrap({uuid: 'platform_customization_local', name: 'test'});
        testWin.executeJavaScript(`document.body.style.backgroundColor = 'red'`)
    }

    changeToBlue = async () => {
        const testWin = await fin.Window.wrap({uuid: 'platform_customization_local', name: 'test'});
        testWin.executeJavaScript(`document.body.style.backgroundColor = 'blue'`)
    }

    setTheme = async (theme) => {
        const root = document.documentElement;

        if (theme === this.LIGHT_THEME) {
            root.classList.add(this.LIGHT_THEME);

        } else {
            root.classList.remove(this.LIGHT_THEME);
        }

        const context = await fin.Platform.getCurrentSync().getWindowContext() || {};
        if (context.theme !== theme) {
            fin.Platform.getCurrentSync().setWindowContext({theme});
        }
    }

    toggleMenu = () => {
        document.querySelector('left-menu').classList.toggle('hidden');
    }
}

customElements.define('title-bar', TitleBar);
