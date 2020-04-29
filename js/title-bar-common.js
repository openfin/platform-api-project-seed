import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

import './layout-container-binding.js';
import './components/header/save-restore-layout-component.js';
import './components/header/lock-unlock-component.js';
import './components/header/pin-unpin-component.js';
import './components/header/clone-layout-component.js';
import './components/header/window-maximize-component.js';
import './components/header/window-minimize-component.js';
import './components/header/window-close-component.js';


class TitleBarCommon extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.addEventListener("maximize-minimize-close-clicked", (e)=>{
            if(e.detail.controlType === "close") {
                fin.me.close().catch(console.error);
            }
        });
        this.render();
    }

    async render() {
        const titleBar = html`
        <div id="title-bar">
                <div class="title-bar-draggable">
                    <div id="title"></div>
                </div>
                <div id="buttons-wrapper">
                    <save-restore-layout></save-restore-layout>
                    <lock-unlock></lock-unlock>
                    <pin-unpin></pin-unpin>
                    <clone-layout></clone-layout>
                    <window-minimize></window-minimize>
                    <window-maximize></window-maximize>
                    <window-close></window-close>
                </div>
            </div>`;
        return render(titleBar, this);
    }
}

customElements.define('title-bar-common', TitleBarCommon);
