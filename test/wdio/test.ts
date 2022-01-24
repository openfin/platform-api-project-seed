
import assert from 'assert';

import { switchWindowByTitle, waitForFinDesktop } from 'wdio-openfin-service';

declare var fin:any;
declare var browser:any;

describe('Click Re-Run button in Health Check page', function() {
        const healthCheckTitle = 'OpenFin Deployment Health Check';
        it(`Switch to ${healthCheckTitle}`, async () => {
            await switchWindowByTitle(healthCheckTitle);
            const title = await browser.getTitle();
            assert.strictEqual(title,  healthCheckTitle);
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
