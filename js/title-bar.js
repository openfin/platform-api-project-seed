import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

//Our Title bar element
class TitleBar extends HTMLElement {
    constructor() {
        super();
        this.LIGHT_THEME = 'light-theme';
        this.DARK_THEME = 'dark';
        this.lastFocusedView = null;

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
        
        fin.Platform.getCurrentSync().on('platform-snapshot-applied', async (evt) => {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await sleep(2000);

            colorChannelAPI.getColorSnapshot()
                .then((colorChannelInfo) => {
                    console.log('colorChannelInfo', colorChannelInfo)
                    const { colorMap, colorContextMap } = colorChannelInfo;
                    const colorMapIterable = Object.entries(colorMap);
                    for (const [name, color] of colorMapIterable) {
                        console.log('name', name)
                        console.log('color', color)
                        const tab = document.getElementById(`tab-${name}`)
                        if (tab) {
                            tab.classList.add(`${color}-channel`);
                        }
                    }
                })
        });

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



        fin.Application.getCurrentSync().addListener('view-focused', (viewEvent) => {
            this.lastFocusedView = viewEvent.viewIdentity;
        })

        fin.Application.getCurrentSync().addListener('view-created', async (viewEvent) => {
            console.log('viewEvent', viewEvent)
            // const view = fin.View.wrapSync(viewEvent);
            // const options = await view.getOptions()
            // if (options.customData && options.customData.colorChannelDeclaration) {
            //     window.colorChannelAPI.changeColorChannel(viewEvent, color);
            //     document.getElementById(`tab-${this.lastFocusedView.name}`).classList.remove('red-channel', 'blue-channel', 'green-channel');
            //     document.getElementById(`tab-${this.lastFocusedView.name}`).classList.add(`${color}-channel`);
            // }
        })
    }

    render = async () => {
        const titleBar = html`
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                    <div class="button" title="red" id="red-button" @click=${this.changeColorChannel}></div>
                    <div class="button" title="blue" id="blue-button" @click=${this.changeColorChannel}></div>
                    <div class="button" title="green" id="green-button" @click=${this.changeColorChannel}></div>
                    <div class="button" title="Toggle Theme" id="theme-button" @click=${this.toggleTheme}></div>
                    <div class="button" title="Toggle Sidebar" id="menu-button" @click=${this.toggleMenu}></div>
                    <div class="button" title="Toggle Layout Lock" id="lock-button" @click=${this.toggleLockedLayout}></div>
                    <div class="button" title="Minimize Window" id="minimize-button" @click=${() => fin.me.minimize().catch(console.error)}></div>
                    <div class="button" title="Maximize Window" id="expand-button" @click=${() => this.maxOrRestore().catch(console.error)}></div>
                    <div class="button" title="Close Window" id="close-button" @click=${() => fin.me.close().catch(console.error)}></div>
                </div>`;
        return render(titleBar, this);
    }

    changeColorChannel = async (evt) => {
        console.log('evt', evt);
        console.log('this.lastFocusedView', this.lastFocusedView);
        const color = evt.target.title;
        window.colorChannelAPI.changeColorChannel(this.lastFocusedView, color);
        document.getElementById(`tab-${this.lastFocusedView.name}`).classList.remove('red-channel', 'blue-channel', 'green-channel');
        document.getElementById(`tab-${this.lastFocusedView.name}`).classList.add(`${color}-channel`);
        fin.View.wrapSync(this.lastFocusedView).updateOptions({ customData: { colorChannelDeclaration: color}})
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
