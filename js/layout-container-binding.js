
    window.addEventListener('DOMContentLoaded', () => {
        const containerId = 'layout-container';
        try {
            fin.Platform.Layout.init({containerId});
        } catch(e) {
            // don't throw me - after API version .50 it won't error anymore
        }
    });
