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
import { storeTemplate } from './template-store.js';
export class LayoutForm extends HTMLElement {
    constructor() {
        super();
        this.saveAsTemplate = () => __awaiter(this, void 0, void 0, function* () {
            const name = this.querySelector('.template-name').value;
            const templateObject = {
                name,
                layout: yield fin.Platform.Layout.getCurrentSync().getConfig()
            };
            storeTemplate(this.templateStorageKey, templateObject);
            this.toggleVisibility();
            return;
        });
        this.hideElement = () => {
            this.classList.add('hidden');
        };
        this.showElement = () => {
            this.classList.remove('hidden');
        };
        this.toggleVisibility = () => {
            this.classList.toggle('hidden');
            document.querySelector('#layout-container').classList.toggle('hidden');
        };
        this.cancel = () => {
            this.toggleVisibility();
        };
        this.render = () => {
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
        };
        this.templateStorageKey = this.constructor.name;
        this.render();
    }
}
customElements.define('layout-form', LayoutForm);
