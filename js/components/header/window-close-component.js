import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

class WindowCloseComponent extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
    }

    async render() {
        const close = html`
                    <div class="button" id="close-button" title='Close Window' @click=${() => this.close().catch(console.error)}></div>
        `;
        return render(close, this);
    }

    async close() {
        fin.me.close().catch(console.error);
    }
}

customElements.define('window-close', WindowCloseComponent);
