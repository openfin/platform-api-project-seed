import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { isPinned, pin, unPin } from '../../pin-unpin.js';

class PinUnPinComponent extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
    }

    async pin() {
        await pin();
        this.savePinStatus(true);
        this.render();
    }

    savePinStatus(isPinned) {
        sessionStorage.setItem(fin.me.identity.name + '-pinned', isPinned);
    }

    async unpin() {
        await unPin();
        this.savePinStatus(false);
        this.render();
    }

    async render() {
        const pinUnpin = html`

                    ${ sessionStorage.getItem(fin.me.identity.name + '-pinned') === "true" ? html`
                    <div class="button" style='height:unset' title='Unpin this window so it isn't always on top' @click=${() => this.unpin().catch(console.error)}>📌</div>`
                    : html`
                    <div class="button" style='height:unset' title='Pin this window so it is always on top' @click=${() => this.pin().catch(console.error)}>📍</div>
                    `}
      `;
        return render(pinUnpin, this);
    }
}

customElements.define('pin-unpin', PinUnPinComponent);
