import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';

class ColorPicker extends HTMLElement {
    constructor() {
        super();

        this.render();
    }

    render = () => {
        const content = html`
        <fieldset>
            <p>
                TICKER
            </p>
            <p id="ticker">
                I am context-sensitive
            </p>
            <p>
                COUNTRY
            </p>
            <p id="country">
                I am context-sensitive
            </p>
            <form @submit=${this.broadcastInstrumentContext}>
                <input id="ticker-input" type="text" placeholder="Enter ticker" autofocus>
                <button action="submit">Broadcast Intrument Context</button>
            </form>
            <form @submit=${this.broadcastCountryContext}>
                <input id="country-input" type="text" placeholder="Enter country code" autofocus>
                <button action="submit">Broadcast Country Context</button>
            </form>
            <button @click=${() => fin.me.showDeveloperTools()}>
                Show dev tools
            </button>
        </fieldset>`;
        return render(content, this);
    }

   broadcastInstrumentContext = async (event) => {
        event.preventDefault();
       const ticker = document.getElementById('ticker-input').value;
        interopAPI.broadcastContext('fdc3.instrument', {id: {ticker}})
    }
   broadcastCountryContext = async (event) => {
        event.preventDefault();
       const ISOALPHA3 = document.getElementById('country-input').value;
        interopAPI.broadcastContext('fdc3.country', {id: {ISOALPHA3}})
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    while (interopAPI === null) {
        await sleep(500);
    }

    customElements.define('color-picker', ColorPicker);

    function handleInteropChange(contextInfo) {
        const {contextType, contextPayload } = contextInfo;
        console.log('contextInfo', contextInfo)
        switch (contextType) {
            case 'fdc3.instrument':
                console.log('fdc3.instrument');
                console.log('contextPayload', contextPayload);
                document.getElementById('ticker').innerText = contextPayload.id.ticker
                break;
            case 'fdc3.country':
                console.log('fdc3.country');
                console.log('contextPayload', contextPayload);
                document.getElementById('country').innerText = contextPayload.id.ISOALPHA3
                break;

            default:
                break;
        }
    }

    interopAPI.receiveContext(handleInteropChange);
});
