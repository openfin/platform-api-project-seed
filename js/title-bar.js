import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

class TitleBar extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
        this.maxOrRestore = this.maxOrRestore.bind(this);
    }

    async render() {
        const titleBar = html`
        <div id="title-bar">
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                    <div class="button" id="minimize-button" title='Minimise Window' @click=${() => fin.me.minimize().catch(console.error)}></div>
                    <div class="button" id="expand-button" title='Maximise Window' @click=${() => this.maxOrRestore().catch(console.error)}></div>
                    <div class="button" id="close-button" title='Close Window' @click=${() => fin.me.close().catch(console.error)}></div>
                </div>
            </div>`;
        return render(titleBar, this);
    }

    async maxOrRestore() {
        if (await fin.me.getState() === "normal") {
            return await fin.me.maximize();
        }

        return fin.me.restore();
    }
}

customElements.define('title-bar', TitleBar);
