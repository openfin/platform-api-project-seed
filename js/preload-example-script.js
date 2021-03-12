console.log("preload script loaded...");

async function init() {
    console.log("Init called. Setting window title");
    const window = fin.Window.getCurrentSync();
    console.log(window);
    window.executeJavaScript('document.title ="Some Friendly Name"');
}

init();