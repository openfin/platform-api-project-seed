
import assert from 'assert';
import 'mocha';
import 'chai';

import {  WebDriver } from '@openfin/automation-helpers';
import { expect } from 'chai';
import { topMenu } from './Menus/topMenuItems'
import { sideMenu } from './Menus/sideMenuItems'
const topMenuIns = new topMenu();
const sideMenuIns = new sideMenu();


// declare var fin:any;

describe('Click Re-Run button in Health Check page', function() {
        const healthCheckTitle = 'OpenFin Deployment Health Check';
        it(`Switch to ${healthCheckTitle}`, async () => {
            await WebDriver.waitForWindow('title', healthCheckTitle, 5000);
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
        await WebDriver.switchToWindow('title', providerPageTitle);
        const title = await WebDriver.getTitle();
        assert.equal(title,  providerPageTitle);
    });

    it("Click Close tab button", async () => {
        const lmTabs = await WebDriver.findElementsByPath('//li[contains(@class, "lm_tab")]');
        return new Promise((resolve) => {
            lmTabs.forEach(async (element) => {
                const title = await element.getAttribute('title');
                if (title === healthCheckTitle) {                    
                    const closeDiv = await element.findElements('xpath', '//div[@class="lm_close_tab"]');
                    await closeDiv[0].click();
                    resolve();
                }
            });    
        });
     });
});

describe('Toggle toolbar and click through the buttons', function() {
    it('Click on toggle theme', async () => {
        await topMenuIns.clickTheme();
        await topMenuIns.verifyWhiteTheme();
        await topMenuIns.clickTheme();
        await topMenuIns.VerifyBlackTheme();
        await topMenuIns.clickTheme();
        await topMenuIns.verifyWhiteTheme();
      
    });

    it('Click on toggle Lock', async () => {
       
        await topMenuIns.clickLock();
        await topMenuIns.verifyLockViews();
        await topMenuIns.clickLock();
        await topMenuIns.verifyUnLockViews();
    });

    it('Click on toggle tootlbar', async () => {
        await topMenuIns.clickToggleSidebar();
        await topMenuIns.verifyShowSideBar();
        await topMenuIns.clickToggleSidebar();
        await topMenuIns.verifyNoSideBar();
    });

});

describe('Create Multiple Views', function() {
    it('Click OF Chart', async () => {
        await topMenuIns.clickToggleSidebar();
        await topMenuIns.verifyShowSideBar();
        await sideMenuIns.clickoFChart();
        await sideMenuIns.verifyoFChartViewOpened();   
        //await sideMenuIns.closeoFChartView("view");
    });

    it('Click Trade View', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickoTradeView();
        await sideMenuIns.verifyTradeViewOpened();     
        //await sideMenuIns.closeoFChartView("view");
    });

    it('Click News', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickoNews();
        await sideMenuIns.verifyNewsOpened();     
        //await sideMenuIns.closeoFChartView("view");
    });

    it('Click Colors', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickColors();
        await sideMenuIns.verifyColorsOpened();  
        await sideMenuIns.verifyColorsViewOpened("red");
        //await sideMenuIns.closeoFChartView("view");
    });

    it('Click Documentation', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickDocs();
        await sideMenuIns.verifyDocsOpened();     
        //await sideMenuIns.closeoFChartView("view");
    });

    it('Click Health Check', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickHealthCheck();
        await sideMenuIns.verifyHealthCheckOpened();     
        //await sideMenuIns.closeoFChartView("view");
    });

});

describe('Drag Views in Grid Layout', function () {
    it('Drag Views in Grid Layout', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickGridView();
        await sideMenuIns.verifyViewsGridLayout("view");
        await sideMenuIns.clickViewTab("Google")
        await WebDriver.sleep(500)
        await sideMenuIns.dragViewDown()
        await WebDriver.sleep(500)
        await sideMenuIns.dragViewUp()
        await WebDriver.sleep(500)
        await sideMenuIns.dragViewLeft()
        await WebDriver.sleep(2000)
        await WebDriver.saveScreenshot() 
    });

});

describe('Drag Views in Tab Layout', function () {
    it('Drag Views in Tab Layout', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickTabView();
        await sideMenuIns.verifyViewsTabLayout("view");
        await sideMenuIns.clickViewTab("Google")
        await sideMenuIns.dragViewDownTab()
        await WebDriver.sleep(500)
        await sideMenuIns.dragViewLeftTab()
        await WebDriver.sleep(2000)  
        await WebDriver.saveScreenshot()  
    });

});
describe('Drag View out of window', function () {
    it('Drag Views in Grid Layout', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickGridView();
        await sideMenuIns.verifyViewsGridLayout("view");
        await sideMenuIns.clickViewTab("Google")
        await sideMenuIns.dragViewtoWindow()
        await WebDriver.sleep(2000)
        await WebDriver.saveScreenshot() 
    });

});

describe('Drag Window into View', function () {
    it('Drag Views in Grid Layout', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.dragWindowToVIew()
        await WebDriver.sleep(2000) 
        await WebDriver.saveScreenshot() 
        await WebDriver.sleep(3000) 
    });

});

describe('Layout Grid,  Clone Layout, Save Layout', function() {
    it('Apply Grid layout and take screenshot and Save layout and Open', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickGridView();
        await sideMenuIns.verifyViewsGridLayout("view");   
        await sideMenuIns.clickSaveLayout()
        await sideMenuIns.enterLayoutInfo("GridLayout")
        await sideMenuIns.verifyLayout("GridLayout", "lm_item lm_column")  
    });
    it('Clone Grid Layout', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickClone();
        await sideMenuIns.verifyViewsGridLayout("window"); 
        await sideMenuIns.dragWindow();  
        await sideMenuIns.closeWindow();
        await sideMenuIns.refocus();
        await WebDriver.switchToWindow("identityString", ["Seed Window", "platform_customization_local"]); 
        await WebDriver.sleep(3000)    
    });
});

describe('Layout Tab and Clone Layout', function() {
    it('Apply Tab layout and take screenshot and Save layout and Open', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickTabView();
        await sideMenuIns.verifyViewsTabLayout("view");    
        await sideMenuIns.clickSaveLayout();
        await sideMenuIns.enterLayoutInfo("TabLayout")
        await sideMenuIns.verifyLayout("TabLayout", "lm_item lm_stack") 
    });
    it('Clone Tab Layout', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickClone();
        await sideMenuIns.verifyViewsTabLayout("window");  
        await sideMenuIns.dragWindow(); 
        await sideMenuIns.refocus();
        await sideMenuIns.closeWindow(); 
        await WebDriver.sleep(3000)   
    });
});

describe('Maximize Window, close view, minimize window, resize window', function() {
    it('Apply Grid layout and take screenshot and Save layout and Open', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickGridView();
        await topMenuIns.clickExpandWindow();
        await WebDriver.sleep(1000)
        await WebDriver.saveScreenshot();
        await topMenuIns.clickExpandWindow();
        await WebDriver.sleep(1000)
        await WebDriver.saveScreenshot();
    });
    it('Apply Grid layout, close view, resize Window', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickGridView();
        await sideMenuIns.closeViewTab("Google")
        await WebDriver.sleep(1000)
        await WebDriver.saveScreenshot();
        await WebDriver.sleep(1000)
        await sideMenuIns.resizeWindow();
        await WebDriver.sleep(1000)
        await WebDriver.saveScreenshot();
    });
});


describe('Launch Platform window and OF window', function() {
    it('Launch Platform window', async () => {
        await WebDriver.switchToWindow("identityString", ["Seed Window", "platform_customization_local"]);
        await sideMenuIns.clickPlatformWindow();
        await sideMenuIns.dragWindow();
        await sideMenuIns.verifyPlatformWindowOpened();  
        await sideMenuIns.closeWindow();
        await WebDriver.sleep (2000)
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
    });

    it('Launch OF window', async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await sideMenuIns.clickofWindow();
        await sideMenuIns.verifyofWindowOpened();    
    });
});

describe('Save Snapshot', function() {
    it('Save a snapshot, close the current window and open in a new window', async () => {
        await WebDriver.switchToWindow("identityString", ["Seed Window", "platform_customization_local"]);
        await sideMenuIns.verifyLayout("GridLayout", "lm_item lm_column")  
        await sideMenuIns.clickSaveSnapshot();
        await sideMenuIns.enterSnapShotInfo("GridSnapshot", "y");  
        await sideMenuIns.verifySnapshotWindow("GridSnapshot", "lm_item lm_column", "y")
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
