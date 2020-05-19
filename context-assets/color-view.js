const platform = fin.Platform.getCurrentSync();

////////////////////////
// Using current API
////////////////////////
async function setColor(event) {
    event.preventDefault();
    const color = event.target.querySelector('input').value;
    await setContext({ color });
}

async function getColor() {
    const context = await platform.getWindowContext();
    return context.color;
}

function applyColor(color) {
    document.body.style.backgroundColor = color;
}

async function setContext(contextObj) {
    await platform.setWindowContext(contextObj);
}

function onContextChanged(e) {
    console.log('event: ', e);
    const { context: { color } } = e;
    applyColor(color);
}

function showDevTools() {
    fin.me.showDeveloperTools();
}

async function init() {
    fin.me.on('host-context-changed', onContextChanged);
    // fin.me.on('host-context-changed', onContextChanged);
    applyColor(await getColor());
}

init();
