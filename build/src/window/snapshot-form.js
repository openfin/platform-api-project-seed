var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { html, render } from 'lit-html';
import { LayoutForm } from './layout-form.js';
import { storeTemplate } from './template-store.js';
class SnapshotForm extends LayoutForm {
    constructor() {
        super();
        this.saveAsTemplate = () => __awaiter(this, void 0, void 0, function* () {
            const name = this.querySelector('.template-name').value;
            const close = this.querySelector('#close').checked;
            console.log(name, close);
            const templateObject = {
                name,
                snapshot: yield fin.Platform.getCurrentSync().getSnapshot(),
                close
            };
            storeTemplate(this.templateStorageKey, templateObject);
            this.toggleVisibility();
            return;
        });
        this.render = () => __awaiter(this, void 0, void 0, function* () {
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
        });
        this.render();
    }
}
customElements.define('snapshot-form', SnapshotForm);
