
import assert from 'assert';
import 'mocha';

import { OpenFinBridgeSystem, WebDriverHelper, OpenFinBridgeWorkspace } from 'openfin-test-helpers';

// declare var fin:any;

describe('Click Re-Run button in Health Check page', function() {
        const healthCheckTitle = 'OpenFin Deployment Health Check';
        it(`Switch to ${healthCheckTitle}`, async () => {
            await WebDriverHelper.waitForWindow(healthCheckTitle, 5000);
            const title = await WebDriverHelper.getTitle();
            assert.strictEqual(title,  healthCheckTitle);
        });

        it('Wait for OpenFin API ready', async () => {
            await WebDriverHelper.waitForObjectExisting('fin.desktop', 5000);
        });

        it("Click Run Again button", async () => {
            const rerunButton = await WebDriverHelper.findElementById("rerun");
            client.elementClick(rerunButton);
        });
    });


describe('Close Health Check page', function() {
    const healthCheckTitle = 'OpenFin Deployment Health Check';
    const providerPageTitle = 'Platform Window Template';
    it(`Switch to ${providerPageTitle}`, async () => {
        await WebDriverHelper.switchToWindow(providerPageTitle);
        const title = await WebDriverHelper.getTitle();
        assert.equal(title,  providerPageTitle);
    });

    it("Click Close tab button", async () => {
        const lmTabs = await WebDriverHelper.findElementsByPath('//li[contains(@class, "lm_tab")]');
        console.log('lmTabs', lmTabs);
        return new Promise((resolve) => {
            lmTabs.forEach(async (element) => {
                const title = await client.getElementAttribute(element, 'title');
                if (title === healthCheckTitle) {
                    const closeDiv = await WebDriverHelper.findElementsFromElementByPath(element, '//div[@class="lm_close_tab"]');
                    console.log('lmTabs closeDiv', closeDiv);
                    await client.elementClick(closeDiv[0]);
                    resolve();
                }
            });    
        });
     });
});

describe('Close App', function() {
    const providerUrl = 'http://localhost:5555/provider.html';
    it(`Switch to ${providerUrl}`, async () => {
        await WebDriverHelper.switchToWindowByUrl(providerUrl);
        const url = await WebDriverHelper.getUrl();
        assert.strictEqual(url,  providerUrl);
        await WebDriverHelper.callMethod('fin.desktop.System.exit', undefined, false);
        await WebDriverHelper.sleep(2000);  // pause here to give Runtime time to exit
    });

});
