
const assert = require('assert');

let switchWindowByTitle = require('wdio-openfin-service').switchWindowByTitle;
let waitForFinDesktop = require('wdio-openfin-service').waitForFinDesktop;


describe('Click Re-Run button in Health Check page', function() {
        const healthCheckTitle = 'OpenFin Deployment Health Check';
        it(`Switch to ${healthCheckTitle}`, async () => {
            await switchWindowByTitle(healthCheckTitle);
            const title = await browser.getTitle();
            assert.equal(title,  healthCheckTitle);
        });

        it('Wait for OpenFin API ready', async () => {
            await waitForFinDesktop();
        });

        it("Click Run Again button", async () => {
            const rerunButton = await browser.$("#rerun");
            await rerunButton.click();
        });
    });


describe('Close Health Check page', function() {
    const healthCheckTitle = 'OpenFin Deployment Health Check';
    const providerPageTitle = 'Platform Window Template';
    it(`Switch to ${providerPageTitle}`, async () => {
        await switchWindowByTitle(providerPageTitle);
        const title = await browser.getTitle();
        assert.equal(title,  providerPageTitle);
    });

    it("Click Close tab button", async () => {
        const lmTabs = await browser.$$("li.lm_tab");
        return new Promise((resolve) => {
            lmTabs.forEach(async (element) => {
                const title = await element.getAttribute('title');
                if (title === healthCheckTitle) {
                    const closeDiv = element.$('div.lm_close_tab');
                    await closeDiv.click();
                    resolve();
                }
            });    
        });
     });
});
