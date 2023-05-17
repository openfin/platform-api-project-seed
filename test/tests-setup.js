import '@testing-library/jest-dom/extend-expect';

class SharedWorker {
    constructor(stringUrl, options) {
        this.url = stringUrl;
        this.onmessage = () => {};
    }

    port = {
        start: () => {},
        postMessage(msg) {
            this.onmessage(msg);
        },
        addEventListener: (name, handler) => {}
    };
}

window.SharedWorker = SharedWorker;

window.fin = undefined;