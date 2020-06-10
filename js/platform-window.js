export const CONTAINER_ID = 'layout-container';
window.addEventListener('DOMContentLoaded', () => {
    // Before .50 AI version this may throw...
    fin.Platform.Layout.init({containerId: CONTAINER_ID});
});
