
import assert from 'assert';
import 'mocha';

import {  WebDriver } from '@openfin/automation-helpers';

// declare var fin:any;

describe('Click Re-Run button in Health Check page', function() {
        const healthCheckTitle = 'OpenFin Deployment Health Check';
        it(`Switch to ${healthCheckTitle}`, async () => {
            await WebDriver.waitForWindow(healthCheckTitle, 5000);
            const title = await WebDriver.getTitle();
            assert.strictEqual(title,  healthCheckTitle);
        });

        it('Wait for OpenFin API ready', async () => {
            await WebDriver.waitForObjectExisting('fin.desktop', 5000);
        });

        it("Click Run Again button", async () => {
            const rerunButton = await WebDriver.findElementById("rerun");
            await rerunButton.click();
        });
    });


describe('Close Health Check page', function() {
    const healthCheckTitle = 'OpenFin Deployment Health Check';
    const providerPageTitle = 'Platform Window Template';
    it(`Switch to ${providerPageTitle}`, async () => {
        await WebDriver.switchToWindow(providerPageTitle);
        const title = await WebDriver.getTitle();
        assert.equal(title,  providerPageTitle);
    });

    it("Click Close tab button", async () => {
        const lmTabs = await WebDriver.findElementsByPath('//li[contains(@class, "lm_tab")]');
        console.log('lmTabs', lmTabs);
        return new Promise((resolve) => {
            lmTabs.forEach(async (element) => {
                const title = await element.getAttribute('title');
                if (title === healthCheckTitle) {                    
                    const closeDiv = await element.findElements('xpath', '//div[@class="lm_close_tab"]');
                    console.log('lmTabs closeDiv', closeDiv);
                    await closeDiv[0].click();
                    resolve();
                }
            });    
        });
     });
});

describe('Close App', function() {
    const providerUrl = 'http://localhost:5555/provider.html';
    it(`Switch to ${providerUrl}`, async () => {
        await WebDriver.switchToWindowByUrl(providerUrl);
        const url = await WebDriver.getUrl();
        assert.strictEqual(url,  providerUrl);
        await WebDriver.callMethod('fin.desktop.System.exit', undefined, false);
        await WebDriver.sleep(2000);  // pause here to give Runtime time to exit
    });

});
