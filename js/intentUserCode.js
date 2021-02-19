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
        fin.me.interop.setContext({type: 'instrument', id: {ticker}})
    }
   broadcastCountryContext = async (event) => {
        event.preventDefault();
       const ISOALPHA3 = document.getElementById('country-input').value;
       fin.me.interop.setContext({type: 'country', id: {ISOALPHA3}})
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    customElements.define('color-picker', ColorPicker);

    function handleInteropChange(contextInfo) {
        const { type, id } = contextInfo;
        switch (type) {
            case 'instrument':
                handleInstrumentChange(contextInfo);
                break;
            case 'country':
                handleCountryChange(contextInfo);
                break;

            default:
                break;
        }
    }

    fin.me.interop.addContextHandler(handleInteropChange);

    function handleInstrumentChange(contextInfo) {
        const { type, id } = contextInfo;
        console.log('contextInfo for instrument', contextInfo)
        console.log('instrument');
        document.getElementById('ticker').innerText = id.ticker
    }
    function handleCountryChange(contextInfo) {
        const { type, id } = contextInfo;
        console.log('contextInfo for country', contextInfo)
        console.log('country');
        document.getElementById('country').innerText = id.ISOALPHA3
    }


    // fin.me.interop.addContextHandler(handleInstrumentChange, 'instrument')
    // fin.me.interop.addContextHandler(handleCountryChange, 'country')
});
