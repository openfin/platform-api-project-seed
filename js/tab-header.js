

function init() {
    var container_id = "layout-container";
    var myLayoutContainer = document.getElementById(container_id);

    // Listen to the tab container "tab-created" event
    myLayoutContainer.addEventListener("tab-created", async (evt) => {
        debugger;
        const { tabSelector, uuid, name } = evt.detail;

        // You can manipulate some aspect of the DOM here aswell.
        const tabElement = document.getElementById(tabSelector);
        const tabClose = tabElement.getElementsByClassName("lm_close_tab")[0];
        const tabLeft = tabElement.getElementsByClassName("lm_left")[0];
        var image = document.createElement("img");
        image.src = "https://www.openfin.co/favicon-32x32.png";
        image.style.width = "14px"
        tabLeft.appendChild(image);

        const targetView = await fin.View.wrap({ uuid, name });
        const info = await targetView.getInfo();

        // You can also add click event handler for the close button if you want to do
        // some custom logic on the close of the tab...
        tabClose.addEventListener("click", (evt) => {
            alert(JSON.stringify(info.url));
        }, { once: true });
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    init();
});