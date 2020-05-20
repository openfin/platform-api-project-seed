const platform = fin.Platform.getCurrentSync();

async function setColor(event) {
    event.preventDefault();
    const color = event.target.querySelector('input').value;
    await platform.setWindowContext({ color });
}

function applyColor(color) {
    document.body.style.backgroundColor = color;
}

function onContextChanged(e) {
    console.log('host-context-changed event: ', e);
    const { context: { color } } = e;
    applyColor(color);
}

async function init() {
    // Sub to future context changes
    fin.me.on('host-context-changed', onContextChanged);

    // Set initial color based on current context value
    const initialContext = await platform.getWindowContext();
    if (initialContext && initialContext.color) {
        applyColor(initialContext.color);
    }

    // UI init
    const setColorForm = document.getElementById('setColorForm');
    setColorForm.addEventListener('submit', setColor);
}

init();
