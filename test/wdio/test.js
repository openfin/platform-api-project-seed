
const assert = require('assert');

async function switchWindow(windowHandle, callback) {
    await browser.switchToWindow(windowHandle);
    const title = await browser.getTitle();
    await callback(title);
}

async function switchWindowByTitle(windowTitle) {
    const handles = await browser.getWindowHandles();
    let handleIndex = 0;
    let checkTitle = async (title) => {
        console.log(title, windowTitle);
        if (title !== windowTitle) {
            handleIndex++;
            if (handleIndex < handles.length) {
                await switchWindow(handles[handleIndex], checkTitle);
            } else {
                // the window may not be loaded yet, so call itself again
                await switchWindowByTitle(windowTitle);
            }
        } else {
            console.log(`matched ${handleIndex}`, title, windowTitle);
        }
    };
    await switchWindow(handles[handleIndex], checkTitle);
}

/**
 *  Check if OpenFin Javascript API fin.desktop.System.getVersion exits
 *
 **/
 async function checkFinGetVersion(callback) {
    const result = await browser.executeAsync(function (done) {
        if (fin && fin.desktop && fin.desktop.System && fin.desktop.System.getVersion) {
            done(true);
        } else {
            done(false);
        }
    });
    callback(result);
 }

 async function waitForFinDesktop() {
    var callback = async (ready) => {
        if (ready === true) {
            readyCallback();
        } else {
            await browser.pause(1000);
            await waitForFinDesktop();
        }
    };
    await checkFinGetVersion(callback);
}


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
