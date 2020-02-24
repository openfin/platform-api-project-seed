function generateComponentConfig() {
    return {
        type: 'component',
        componentName: 'view',
        componentState: {
            url: '',
            name: ''
        }
    };
}

const config = {
    content: [{
        type: 'row',
        id: 'mainRow',
        content: [generateComponentConfig(), {
            type: 'column',
            content: [generateComponentConfig(), generateComponentConfig()]
        }]
    }]
};

function getRandomName() {
    return `component_${Date.now() + Math.floor(Math.random() * 10000)}`;
}
const replaceCloseButton = tab => {
    const oldCloseButton = tab.element[0].getElementsByClassName("lm_close_tab")[0];
    console.dir(oldCloseButton)

    const newCloseButton = document.createElement('div');
    newCloseButton.className = 'tab-button';
    newCloseButton.id = 'close-tab-icon';
    newCloseButton.onclick = () => tab.contentItem.remove();

    oldCloseButton.parentNode.replaceChild(newCloseButton, oldCloseButton);
}

var myLayout = new GoldenLayout(config, document.getElementById('layout'));
myLayout.on('tabCreated', replaceCloseButton);
let version = 'alpha';
async function getDefaultRuntimeForBrowserView() {
    try {
        const res = await fetch('https://cdn.openfin.co/release/runtime/alpha');
        version = await res.text();
        renderConfig();
    } catch (error) {
        console.error(error);
    }
}

getDefaultRuntimeForBrowserView();

function renderConfig () {
    var state = JSON.stringify(makeAppConfig(getPlatformConfig()));
    document.getElementById('state').innerHTML = state;
}

myLayout.on('stateChanged', renderConfig);

function getPlatformConfig() {
    return { content: myLayout.toConfig().content }
}

var persistentComponent = function (container, state) {
    const form = $(`<form>
    <label for="url">URL: </label>
    <input name="url" id="url" type="text" value="" />
    </form>`);

    function updateState() {
        const values = form.serializeArray();
        const reduced = values.reduce((obj, { name, value }) => Object.assign(obj, { [name]: value, name: getRandomName() }), {});
        container.setState(reduced);
    }

    form.submit((e) => {
        // prevent default so page doesn't reload when submitting form
        e.preventDefault();
        updateState();
    });

    // Store state updates
    form.change(function () {
        updateState();
    });

    // Append it to the DOM
    container.getElement().append(form);
};

const addViewBtn = document.querySelector('#addView');

addViewBtn.addEventListener('click', () => {
    myLayout.root.contentItems[0].addChild(generateComponentConfig());
});

const copyConfigBtn = document.querySelector('#copyConfig');

copyConfigBtn.addEventListener('click', () => {
    const config = document.querySelector('#state').innerHTML;
    navigator.clipboard.writeText(config);
});

if ('fin' in window) {
    const launchConfigBtn = document.createElement('button');
    launchConfigBtn.innerText = 'Launch Config';
    launchConfigBtn.setAttribute('id', 'launchConfig');
    const buttonsDiv = document.querySelector('#buttons');
    buttonsDiv.appendChild(launchConfigBtn);

    launchConfigBtn.addEventListener('click', () => {
        const layout = { content: myLayout.toConfig().content };
        console.log(config);
        const platform = fin.Platform.getCurrentSync();
        platform.createWindow({ layout });
    });
}

myLayout.registerComponent('view', persistentComponent);
myLayout.init();
document.getElementById('makeinstaller').addEventListener('click', () => makeInstaller('win'))
function makeAppConfig(layout) {
    return {
        "runtime": {
            "arguments": "--v=1 --inspect",
            "version": version
        },
        "shortcut": {
            "company": "OpenFin",
            "description": "Platform Demo",
            "icon": "https://openfin.github.io/golden-prototype/favicon.ico",
            "name": "Platform Generated App"
        },
        "platform": {
            "uuid": "platform_prototype_generated",
            "applicationIcon": "https://openfin.github.io/golden-prototype/favicon.ico",
            "autoShow": false
        },
        "snapshot": {
            "windows": [
                {
                    "defaultWidth": 800,
                    "defaultHeight": 600,
                    "defaultLeft": 0,
                    "defaultTop": 0,
                    "saveWindowState": false,
                    "backgroundThrottling": true,
                    layout
                }]
        }
    }
}
async function makeInstaller(os) {
    const platformConfig = getPlatformConfig();
    const baseConfig = makeAppConfig(platformConfig);

    const res = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(baseConfig), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const configUrl = res.headers.get('Location')
    window.open(`https://openfin.github.io/start/?manifest=${encodeURIComponent(configUrl)}`)
}
