import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import viewContainer from './view-container.js';

class ViewTabExample extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
        this.init();
    }

    async init() {
        viewContainer.onViewContainerChange(async ()=> {
            let options = viewContainer.getOptions();
            await viewContainer.updateOptions(options);
        })
    }

    async canClose() {
        await viewContainer.updateOptions({
           canClose:true
       });
    }

    async cannotClose() {
        await viewContainer.updateOptions({
            canClose:false
        });
    }

    async canMove() {
        await viewContainer.updateOptions({
            canMove:true
        });
    }

    async cannotMove() {
        await viewContainer.updateOptions({
            canMove:false
        });
    }

    async render() {
        const viewContainerControls = html`
        <div>
        <p><button @click=${() => this.canClose().catch(console.error)}>Can Close View</button></p>
        <p><button @click=${() => this.cannotClose().catch(console.error)}>Cannot Close View</button></p>
        <p><button @click=${() => this.canMove().catch(console.error)}>Can Move View</button></p>
        <p><button @click=${() => this.cannotMove().catch(console.error)}>Cannot Move View</button></p>
        </div>`;
        return render(viewContainerControls, this);
    }
}

customElements.define('view-tab-example', ViewTabExample);
