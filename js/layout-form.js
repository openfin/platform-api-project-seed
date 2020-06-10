import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { storeTemplate } from './template-store.js';

export class LayoutForm extends HTMLElement {
    constructor() {
        super();

        this.templateStorageKey = this.constructor.name;
        this.render();
    }

     saveAsTemplate = async () => {
        const name = this.querySelector('.template-name').value;
        const templateObject = {
            name,
            layout: await fin.Platform.Layout.getCurrentSync().getConfig()
        };

        storeTemplate(this.templateStorageKey, templateObject);

        this.toggleVisibility();
        return;
    }

    hideElement = () => {
        this.classList.add('hidden');
    }

    showElement = () => {
        this.classList.remove('hidden');
    }

    toggleVisibility = () => {
        this.classList.toggle('hidden');
        document.querySelector('#layout-container').classList.toggle('hidden');
    }

    cancel = () => {
        this.toggleVisibility();
    }

    render = () => {
        const layoutMenu = html`
            <div class="center-form">
                <fieldset>
                     <legend>Save the current Views in this Window as a Layout template</legend>
                     <input type="text" class="template-name" size="50"
                         value="New Layout"/> <br>
                     <button @click=${this.saveAsTemplate}>Save Layout</button>
                     <button @click=${this.cancel}>Cancel</button>
                 </fieldset>
             </div>`;
        return render(layoutMenu, this);
    }
}

customElements.define('layout-form', LayoutForm);
