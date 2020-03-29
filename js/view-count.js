import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import viewHost from './view-host.js';

class ViewCount extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.render();
        this.init();
    }

    async init() {
        viewHost.onHostChange(async (data)=>{
            await this.watchViewCount();
        });
        await this.watchViewCount();
    }

    async watchViewCount(){
        if(this.disposable !== undefined) {
            this.disposable.dispose();
        }

        this.disposable = viewHost.onHostViewCountChange(async (data) => {
            console.log("On view host view count change:" + JSON.stringify(data));
            this.viewCount = data.viewCount;
            this.render();
        });

        this.viewCount = await viewHost.getViewCount();
        this.render();
    }

    async render() {
        const viewCount = html`
        <div>
       View Count: ${this.viewCount}
        </div>`;
        return render(viewCount, this);
    }
}

customElements.define('view-count', ViewCount);
