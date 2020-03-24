import { getSnapShot, clearSnapShot } from './platform-store.js';

const defaultLayout = {
    windows: [
        {
            url: "http://localhost:5556/platform-window-main.html",
            layout: {
                content: [
                    {
                        type: "stack",
                        id: "no-drop-target",
                        content: [
                            {
                                type: "component",
                                componentName: "view",
                                componentState: {
                                    name: "component_A1",
                                    processAffinity: "ps_1",
                                    url: "https://cdn.openfin.co/embed-web/chart.html"
                                }
                            }
                        ]
                    }
                ]
            }
        }
    ]
};

async function init() {
    const storedSnapshot = getSnapShot();
    if (storedSnapshot) {
        clearSnapShot();
        return fin.Platform.getCurrentSync().applySnapshot(storedSnapshot, {
            closeExistingWindows: true
        });
    } else {
        return fin.Platform.getCurrentSync().applySnapshot(defaultLayout, {
            closeExistingWindows: true
        });
    }
}

window.addEventListener('DOMContentLoaded', (event) => {
    // this is still required. Need a better event to listen to before we can use the platform api.
    setTimeout(init, 1000);
});
