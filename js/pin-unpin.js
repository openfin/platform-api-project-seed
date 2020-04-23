let _currentWindow;

export async function isPinned() {

    let win = getCurrentWindow();

    let options = await win.getOptions();

    return options.alwaysOnTop === true;
}

export async function pin() {
    const options = {
        "alwaysOnTop": true
    };

    let win = getCurrentWindow();

    await win.updateOptions(options);
}

export async function unPin() {
    const options = {
        "alwaysOnTop": false
    };

    let win = getCurrentWindow();

    await win.updateOptions(options);
}

export async function togglePinState(){
    let pinned = await isPinned();
    if(pinned) {
        await unPin();
    } else {
        await pin();
    }
}

function getCurrentWindow() {
    if(_currentWindow === undefined) {
        _currentWindow = fin.Window.getCurrentSync();
    }
    return _currentWindow;
}
