import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

class ColorPicker extends HTMLElement {
    constructor() {
        super();

        this.render();
        fin.me.on('host-context-changed', this.onContextChanged);

        // Set initial color based on current context value
        fin.Platform.getCurrentSync().getWindowContext().then(initialContext => {
            if (initialContext && initialContext.color) {
                this.applyColor(initialContext.color);
            }
        });

    }

    render = () => {
        const content = html`
        <fieldset>
            <p>
                I am context-sensitive
            </p>
            <form @submit=${this.setColor}>
                <input type="text" placeholder="Enter color" autofocus>
                <button action="submit">Set Color</button>
            </form>
            <button @click=${() => fin.me.showDeveloperTools()}>
                Show dev tools
            </button>
        </fieldset>`;
        return render(content, this);
    }

   setColor = async (event) => {
        event.preventDefault();
        const color = this.querySelector('input').value;
        await fin.Platform.getCurrentSync().setWindowContext({ color });
    }

   applyColor = async (color) => {
        document.body.style.backgroundColor = color;
    }

    onContextChanged = (e) => {
        const { context: { color } } = e;
        this.applyColor(color);
    }
}


customElements.define('color-picker', ColorPicker);
