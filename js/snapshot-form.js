import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { LayoutForm } from './layout-form.js';
import { storeTemplate } from './template-store.js';

class SnapshotForm extends LayoutForm {
    constructor() {
        super();

        this.render();
    }

    saveAsTemplate = async () => {
        const name = this.querySelector('.template-name').value;
        const close = this.querySelector('#close').checked;

        console.log(name, close);
        const templateObject = {
            name,
            snapshot: await fin.Platform.getCurrentSync().getSnapshot(),
            close
        };

        storeTemplate(this.templateStorageKey, templateObject);

        this.toggleVisibility();
        return;
    }

    render = async () => {
        const snapshotMenu = html`
            <div class="center-form">
                <fieldset>
                     <legend>Save all current Platform Windows as a Snapshot</legend>
                     <input type="text" class="template-name" size="50"
                         value="New Snapshot"/> <br>
                     <input type="checkbox" id="close" name="close"
                         checked>
                     <label for="close">Close Platform before restoring Snapshot</label> <br>
                     <button @click=${this.saveAsTemplate}>Save Snapshot</button>
                     <button @click=${this.cancel}>Cancel</button>
                 </fieldset>
             </div>`;
        return render(snapshotMenu, this);
    }
}

customElements.define('snapshot-form', SnapshotForm);
