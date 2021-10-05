

function init() {
    var container_id = "layout-container";
    var myLayoutContainer = document.getElementById(container_id);

    // Listen to the tab container "tab-created" event
    myLayoutContainer.addEventListener("tab-created", async (evt) => {
        debugger;
        const { tabSelector, uuid, name } = evt.detail;
        const tabElement = document.getElementById(tabSelector);
        const tabClose = tabElement.getElementsByClassName("lm_close_tab")[0];

        // You can manipulate some aspect of the DOM here aswell.
        tabElement.style.backgroundColor = "#ff840f";

        const targetView = await fin.View.wrap({ uuid, name });
        const options = await targetView.getOptions();
        const info = await targetView.getInfo();
        // This is where you can add your click event handler for the close button
        tabClose.addEventListener("click", (evt) => {
            alert(JSON.stringify(info.url));
        }, { once: true });
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    init();
});