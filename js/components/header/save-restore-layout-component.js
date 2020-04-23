import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { isLayoutLocked } from '../../layout-locking.js';

class SaveRestoreLayoutComponent extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
    }

    saveLockStatus(isLocked) {
        sessionStorage.setItem(fin.me.identity.name + '-locked', isLocked);
    }

    async saveWindowLayout() {
        const winLayoutConfig = await fin.Platform.Layout.getCurrentSync().getConfig();
        sessionStorage.setItem(fin.me.identity.name, JSON.stringify(winLayoutConfig));
        this.render();
    }

    async restoreWindowLayout() {
        const storedWinLayout = sessionStorage.getItem(fin.me.identity.name);
        if (storedWinLayout) {
            let winLayout = JSON.parse(storedWinLayout);
            let isWinLayoutLocked = await isLayoutLocked(winLayout);
            this.saveLockStatus(isWinLayoutLocked);
            return fin.Platform.Layout.getCurrentSync().replace(winLayout);
        } else {
            throw new Error("No snapshot found in sessionstorage");
        }
    }

    async render() {
        const saveRestoreLayout = html`

        <div class="button" style='height:unset'  title='Save this window layout' @click=${() => this.saveWindowLayout().catch(console.error)}>💾</div>
        ${ sessionStorage.getItem(fin.me.identity.name) !== null ? html`
        <div class="button" style='height:unset' title='Restore this window layout' @click=${() => this.restoreWindowLayout().catch(console.error)}>📂</div>`
        : html``}
      `;
        return render(saveRestoreLayout, this);
    }
}

customElements.define('save-restore-layout', SaveRestoreLayoutComponent);
