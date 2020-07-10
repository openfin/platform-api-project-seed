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
//Our Title bar element
class TitleBar extends HTMLElement {
    constructor() {
        super();
        this.render = () => __awaiter(this, void 0, void 0, function* () {
            const titleBar = html`
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                    <div class="button" title="Toggle Theme" id="theme-button" @click=${this.toggleTheme}></div>
                    <div class="button" title="Toggle Sidebar" id="menu-button" @click=${this.toggleMenu}></div>
                    <div class="button" title="Toggle Layout Lock" id="lock-button" @click=${this.toggleLockedLayout}></div>
                    <div class="button" title="Minimize Window" id="minimize-button" @click=${() => fin.me.minimize().catch(console.error)}></div>
                    <div class="button" title="Maximize Window" id="expand-button" @click=${() => this.maxOrRestore().catch(console.error)}></div>
                    <div class="button" title="Close Window" id="close-button" @click=${() => fin.me.close().catch(console.error)}></div>
                </div>`;
            return render(titleBar, this);
        });
        this.maxOrRestore = () => __awaiter(this, void 0, void 0, function* () {
            if ((yield fin.me.getState()) === 'normal') {
                return yield fin.me.maximize();
            }
            return fin.me.restore();
        });
        this.toggleLockedLayout = () => __awaiter(this, void 0, void 0, function* () {
            const oldLayout = yield fin.Platform.Layout.getCurrentSync().getConfig();
            const { settings, dimensions } = oldLayout;
            if (settings.hasHeaders && settings.reorderEnabled) {
                fin.Platform.Layout.getCurrentSync().replace(Object.assign(Object.assign({}, oldLayout), { settings: Object.assign(Object.assign({}, settings), { hasHeaders: false, reorderEnabled: false }) }));
            }
            else {
                fin.Platform.Layout.getCurrentSync().replace(Object.assign(Object.assign({}, oldLayout), { settings: Object.assign(Object.assign({}, settings), { hasHeaders: true, reorderEnabled: true }), dimensions: Object.assign(Object.assign({}, dimensions), { headerHeight: 25 }) }));
            }
        });
        this.toggleTheme = () => __awaiter(this, void 0, void 0, function* () {
            let themeName = this.DARK_THEME;
            if (!document.documentElement.classList.contains(this.LIGHT_THEME)) {
                themeName = this.LIGHT_THEME;
            }
            this.setTheme(themeName);
        });
        this.setTheme = (theme) => __awaiter(this, void 0, void 0, function* () {
            const root = document.documentElement;
            if (theme === this.LIGHT_THEME) {
                root.classList.add(this.LIGHT_THEME);
            }
            else {
                root.classList.remove(this.LIGHT_THEME);
            }
            const context = (yield fin.Platform.getCurrentSync().getWindowContext()) || {};
            if (context.theme !== theme) {
                fin.Platform.getCurrentSync().setWindowContext({ theme });
            }
        });
        this.toggleMenu = () => {
            document.querySelector('left-menu').classList.toggle('hidden');
        };
        this.LIGHT_THEME = 'light-theme';
        this.DARK_THEME = 'dark';
        this.render();
        fin.Platform.getCurrentSync().getWindowContext().then(initialContext => {
            if (initialContext && initialContext.theme) {
                this.setTheme(initialContext.theme);
            }
        });
        fin.Platform.getCurrentSync().on('window-context-changed', (evt) => __awaiter(this, void 0, void 0, function* () {
            const context = yield fin.Platform.getCurrentSync().getWindowContext();
            //we only want to react to events that include themes
            if (evt.context.theme && evt.context.theme !== context.theme) {
                this.setTheme(evt.context.theme);
            }
        }));
        fin.me.on('layout-ready', () => __awaiter(this, void 0, void 0, function* () {
            // Whenever a new layout is ready on this window (on init, replace, or applyPreset)
            const { settings } = yield fin.Platform.Layout.getCurrentSync().getConfig();
            // determine whether it is locked and update the icon
            if (settings.hasHeaders && settings.reorderEnabled) {
                document.getElementById('lock-button').classList.remove('layout-locked');
            }
            else {
                document.getElementById('lock-button').classList.add('layout-locked');
            }
        }));
    }
}
customElements.define('title-bar', TitleBar);
