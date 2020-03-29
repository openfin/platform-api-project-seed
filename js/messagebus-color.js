import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import viewHost from './view-host.js';

class MessageBusColor extends HTMLElement {

    constructor() {
        super();
        this._viewCount = "";
        this.render = this.render.bind(this);
        this.render();
        this.init();
     }

     async updateViews(event) {
        let backgroundColor = event.target.value;
        viewHost.sendToViews({ backgroundColor }, this._linkedHostId);
     }

     async onViewUpdate(update) {
        await viewHost.setContext({ backgroundColor:update.message.backgroundColor });
        document.body.style.backgroundColor = update.message.backgroundColor;
        this._colorWell.value = update.message.backgroundColor;
     }

     async init() {
        let context = await viewHost.getContext();
        console.log("Context returned:" + JSON.stringify(context));

        await this.applyContext();
        await this.saveContext();

        this._colorWell = document.querySelector("#colorWell-iab");
        this._colorWell.addEventListener("change", this.updateViews.bind(this), false);
        this._colorWell.select();
        await this.onViewUpdate({
            message: {backgroundColor:this._backgroundColor}
        });

        await this.listenToViews();

        viewHost.onHostChange(async (data)=>{
            if(data.viewCount !== 1) {
                await this.applyContext();
                await this.listenToViews();
                await this.onViewUpdate({
                    message: {
                        backgroundColor: this._backgroundColor
                    }
                })
            } else {
              await this.saveContext();
            }
        });

        viewHost.onContextChange((newContext)=> {
            console.log("On Host Context Change: " + JSON.stringify(newContext));
        });
     }

     async applyContext(){
        let context = await viewHost.getContext();

        if(context !== undefined && context !== null) {
            if(context.backgroundColor !== undefined) {
                this._backgroundColor = context.backgroundColor;
            }

            if(context.linkedHostId !== undefined) {
                this._linkedHostId = context.linkedHostId;
            }
        }

        if(this._linkedHostId === undefined) {
            this._linkedHostId = await viewHost.getCurrentId();
        }

        if(this._backgroundColor === undefined) {
            this._backgroundColor ="#ff0000";
        }
     }

     async saveContext(){
        await viewHost.setContext({backgroundColor: this._backgroundColor, linkedHostId:this._linkedHostId});
     }

    async listenToViews() {
        if(this._unsubscribeFromMessages !== undefined) {
            this._unsubscribeFromMessages.dispose();
        }
        this._unsubscribeFromMessages = await viewHost.listenToViews(this.onViewUpdate.bind(this), false, this._linkedHostId);
    }

    async render() {
        const colorWell = html`
        <div id="messagebus-color-container">
        <label for="colorWell-iab">Background Color:</label>
        <input type="color" value="#ff0000" id="colorWell-iab">
        </div>`;
        return render(colorWell, this);
    }
}

customElements.define('messagebus-color', MessageBusColor);
