import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

class ColorPicker extends HTMLElement {
    constructor() {
        super();
        this.render = this.render.bind(this);
        this.setColor = this.setColor.bind(this);
        this.applyColor = this.applyColor.bind(this);
        this.onContextChanged = this.onContextChanged.bind(this);

        fin.me.on('host-context-changed', this.onContextChanged);

        // Set initial color based on current context value
        fin.Platform.getCurrentSync().getWindowContext().then(initialContext => {
            if (initialContext && initialContext.color) {
                this.applyColor(initialContext.color);
            }
        });
        this.render();
    }

    async render() {
        const content = html`
        <fieldset>
            <p>
                I am context-sensitive
            </p>
            <div>
                <input type="text" placeholder="Enter color" autofocus>
                <button @click=${this.setColor}>Set Color</button>
            </form>
            <button @click=${fin.me.showDeveloperTools}>
                Show dev tool
            </button>
        </fieldset>`;
        return render(content, this);
    }

    async setColor(event) {
        event.preventDefault();
        const color = this.querySelector('input').value;
        await fin.Platform.getCurrentSync().setWindowContext({ color });
    }

    applyColor(color) {
        document.body.style.backgroundColor = color;
    }

    onContextChanged(e) {
        const { context: { color } } = e;
        this.applyColor(color);
    }
}


customElements.define('color-picker', ColorPicker);
