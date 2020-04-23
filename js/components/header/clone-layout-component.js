import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

class CloneLayoutComponent extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
    }

    async clone() {
        let winLayout = fin.Platform.Layout.getCurrentSync();
        let config = await winLayout.getConfig();

        // work around (this is not the official way this is a workaround until I can investigate why the name of the views is trying to be re-used)
        let content = JSON.stringify(config.content);
        content = content.replace(/internal-generated-view-/gi, 'internal-generated-view-' + Date.now() + "-");

        fin.Platform.getCurrentSync().createWindow({
            layout: {
                content: JSON.parse(content)
            }
        });
    }

    async render() {
        const clone = html`
                    <div class="button" style='height:unset' title='Clone this layout' @click=${() => this.clone().catch(console.error)}>🧬</div>
      `;
        return render(clone, this);
    }
}

customElements.define('clone-layout', CloneLayoutComponent);
