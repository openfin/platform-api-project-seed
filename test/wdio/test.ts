
import assert from 'assert';

import { switchWebContentByTitle, switchWebContentByURL, waitForFinDesktop } from 'wdio-openfin-service';

declare var fin:any;

after('All done', async () => {
    console.log('all done');
    await browser.deleteSession();
    browser.getUrl()
})

describe('Click Re-Run button in Health Check page', function() {
        const healthCheckTitle = 'OpenFin Deployment Health Check';
        it(`Switch to ${healthCheckTitle}`, async () => {
            await switchWebContentByTitle(healthCheckTitle);
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
        await switchWebContentByTitle(providerPageTitle);
        const title = await browser.getTitle();
        assert.equal(title,  providerPageTitle);
    });

    it("Click Close tab button", async () => {
        const lmTabs = await browser.$$("li.lm_tab");
        return new Promise((resolve) => {
            lmTabs.forEach(async (element: WebdriverIO.Element) => {
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

describe('Close App', function() {
    const providerUrl = 'http://localhost:5555/provider.html';
    it(`Switch to ${providerUrl}`, async () => {
        await switchWebContentByURL(providerUrl);
        const url = await browser.getUrl();
        assert.strictEqual(url,  providerUrl);
        await browser.execute(function () {
            fin.desktop.System.exit();
        });
        await browser.pause(2000);  // pause here to give Runtime time to exit
    });

});
