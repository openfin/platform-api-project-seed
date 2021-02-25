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
                INSTRUMENT
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
            <form @submit=${this.setInstrumentContext}>
                <input id="ticker-input" type="text" placeholder="Enter ticker" autofocus>
                <button action="submit">Set Intrument Context</button>
            </form>
            <form @submit=${this.setCountryContext}>
                <input id="country-input" type="text" placeholder="Enter country code" autofocus>
                <button action="submit">Set Country Context</button>
            </form>
            <button @click=${() => fin.me.showDeveloperTools()}>
                Show dev tools
            </button>
        </fieldset>`;
        return render(content, this);
    }

   setInstrumentContext = async (event) => {
        event.preventDefault();
       const ticker = document.getElementById('ticker-input').value;
        fin.me.interop.setContext({type: 'instrument', id: {ticker}})
    }
   setCountryContext = async (event) => {
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
        // throw new Error(`testing errors in handlers ${JSON.stringify(contextInfo)}`)
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
