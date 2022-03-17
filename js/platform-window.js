export const CONTAINER_ID = 'layout-container';

window.addEventListener('DOMContentLoaded', async () => {

    // Before .50 AI version this may throw...
    await fin.Platform.Layout.init({ containerId: CONTAINER_ID });
});
