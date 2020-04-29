import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

class WindowMaximizeComponent extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
        this.maxOrRestore = this.maxOrRestore.bind(this);
    }

    async render() {
        const maximize = html`
                    <div class="button" id="expand-button" title='Maximise Window' @click=${() => this.maxOrRestore().catch(console.error)}></div>
        `;
        return render(maximize, this);
    }

    async maxOrRestore() {
        if (await fin.me.getState() === "normal") {
            await fin.me.maximize();
            this.raiseEvent('maxOrRestore', 'maximized');
        } else {
            fin.me.restore();
            this.raiseEvent('maxOrRestore', 'restored');
        }
    }
}

customElements.define('window-maximize', WindowMaximizeComponent);
