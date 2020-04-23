import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { isLayoutLocked, lockLayout, unlockLayout } from '../../layout-locking.js';

class LockUnlockComponent extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
    }

    async lockLayout() {
        await lockLayout();
        this.saveLockStatus(true);
        this.render();
    }

    saveLockStatus(isLocked) {
        sessionStorage.setItem(fin.me.identity.name + '-locked', isLocked);
    }

    async unlockLayout() {
        await unlockLayout();
        this.saveLockStatus(false);
        this.render();
    }

    async render() {
        const lockUnlock = html`

                    ${ sessionStorage.getItem(fin.me.identity.name + '-locked') === "true" ? html`
                    <div class="button" style='height:unset' title='Unlock this layout' @click=${() => this.unlockLayout().catch(console.error)}>🔓</div>`
                    : html`
                    <div class="button" style='height:unset' title='Lock this layout' @click=${() => this.lockLayout().catch(console.error)}>🔒</div>
                    `}
      `;
        return render(lockUnlock, this);
    }
}

customElements.define('lock-unlock', LockUnlockComponent);
