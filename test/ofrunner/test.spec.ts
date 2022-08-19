
import { strict as assert } from 'assert';

import 'mocha';

import {  WebDriver } from '@openfin/automation-helpers';

// declare var fin:any;

describe('Click Re-Run button in Health Check page', function() {
        const healthCheckTitle = 'OpenFin Deployment Health Check';
        it(`Switch to ${healthCheckTitle}`, async () => {
            await WebDriver.waitForWindow('title', healthCheckTitle, 5000);
            const title = await WebDriver.getTitle();
            assert.strictEqual(title,  healthCheckTitle);
            const wins = await WebDriver.getWindows();
            console.log('got all windows', wins);
        });

        it('Wait for OpenFin API ready', async () => {
            await WebDriver.waitForObjectExisting('fin.desktop', 5000);
        });

        it("Click Run Again button", async () => {
            const rerunButton = await WebDriver.findElementById("rerun");
            await rerunButton.click();
        });
});


// describe('Close Health Check page', function() {
//     const healthCheckTitle = 'OpenFin Deployment Health Check';
//     const providerPageTitle = 'Platform Window Template';
//     it(`Switch to ${providerPageTitle}`, async () => {
//         await WebDriver.switchToWindow('title', providerPageTitle);
//         const title = await WebDriver.getTitle();
//         assert.equal(title,  providerPageTitle);
//     });

//     it("Click Close tab button", async () => {
//         const lmTabs = await WebDriver.findElementsByPath('//li[contains(@class, "lm_tab")]');
//         return new Promise((resolve) => {
//             lmTabs.forEach(async (element) => {
//                 const title = await element.getAttribute('title');
//                 if (title === healthCheckTitle) {                    
//                     const closeDiv = await element.findElements('xpath', '//div[@class="lm_close_tab"]');
//                     await closeDiv[0].click();
//                     resolve();
//                 }
//             });    
//         });
//      });
// });

describe('Close window', function() {
    it('Close 2nd window', async () => {
        const wins = await WebDriver.getWindows();
        for (const element of wins) {
            const id = element.identity;
            console.log(id);
            if (id.name.includes("internal-generated-window"))
            {
                console.log("yes it is! :)", id.name)
                await WebDriver.switchToWindow('handle', element.handle);
                const close = await WebDriver.findElementById("close-button");
                await close?.click();
                break;
            }
        };

        await WebDriver.switchToWindow("identityString", ["Seed Window", "platform_customization_local"]);
        const title = await WebDriver.getTitle();
        console.log(title);
    });
});

describe('Close App', function() {
    const providerUrl = 'http://localhost:5555/provider.html';
    it(`Switch to ${providerUrl}`, async () => {
        await WebDriver.switchToWindow('url', providerUrl);
        const url = await WebDriver.getUrl();
        assert.strictEqual(url,  providerUrl);
        await WebDriver.callMethod('fin.desktop.System.exit', undefined, false);
        await WebDriver.sleep(2000);  // pause here to give Runtime time to exit
    });

});
