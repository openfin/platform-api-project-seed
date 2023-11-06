

import {  WebDriver } from '@openfin/automation-helpers';
import { topMenu } from './Menus/topMenuItems'
const topMenuIns = new topMenu();
import { sideMenu } from './Menus/sideMenuItems'
const sideMenuIns = new sideMenu();

function test(result:any){
    const {url}:any = result;
    console.log(url)
    return url
}

describe('Health Check page', function() {
        const healthCheckTitle = 'OpenFin Deployment Health Check';

        it(`Switch to ${healthCheckTitle}`, async () => {
            await WebDriver.waitForWindow('title', healthCheckTitle, 5000);
            const title = await WebDriver.getTitle();
            expect(title).toBe(healthCheckTitle);
            //assert.(title,  healthCheckTitle);
        });

        it('validate runtime status and version', async () => {
            await WebDriver.sleep(5000)
            await topMenuIns.validateRuntimeStatus("33.116.77.11");
        });


        it('Wait for OpenFin API ready', async () => {
            await WebDriver.waitForObjectExisting('fin.desktop', 5000);
        });

    });



    it("C24877 - validate tab-closed will fire when the close button a tab is clicked", async () => {

        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await WebDriver.sleep(2000);
      
        const script = "layoutContainer = document.getElementById('layout-container'), layoutContainer.addEventListener('tab-closed', (CustomEvent) => {window.layoutContainerResult = CustomEvent.detail })"
        await WebDriver.executeAsync(script);
        await sideMenuIns.clickCloseView("OpenFin Deployment Health Check");
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => console.log(result));
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => expect(result).toBeDefined);
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => expect(test(result)).toEqual("https://cdn.openfin.co/health/deployment/index.html"));
  
    });

    it("C24878 - validate tab-dropped will fire any time a tab is dropped same window - tab dropped within it’s current window", async () => {

        await topMenuIns.clickToggleSidebar();
        await topMenuIns.verifyShowSideBar();
        await sideMenuIns.clickoFChart();

        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await WebDriver.sleep(2000);
        const script = "layoutContainer = document.getElementById('layout-container'), layoutContainer.addEventListener('tab-dropped', (CustomEvent) => {window.layoutContainerResult = CustomEvent.detail })"
        await WebDriver.executeAsync(script);
        await sideMenuIns.dragViewRightTab()
        await WebDriver.sleep(2000);
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => console.log(result));
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => expect(result).toBeDefined);
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => expect(test(result)).toEqual("https://cdn.openfin.co/embed-web/chart.html"));
  
    });

    it("C24879 - validate tab-dropped will fire any time a tab is dropped out of window - tab dropped outside current window to create a new window", async () => {

        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await WebDriver.sleep(2000);
        const script = "layoutContainer = document.getElementById('layout-container'), layoutContainer.addEventListener('tab-dropped', (CustomEvent) => {window.layoutContainerResult = CustomEvent.detail })"
        await WebDriver.executeAsync(script);
        await sideMenuIns.dragViewRightOutWin()
        await WebDriver.sleep(2000);
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => console.log(result));
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => expect(result).toBeDefined);
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => expect(test(result)).toEqual("https://cdn.openfin.co/embed-web/chart.html"));
  
    });

    it("C24880 - validate tab-dropped will fire any time a tab is dropped from other window - tab dropped from a different window into a window with the listener", async () => {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
        await WebDriver.sleep(2000);
        
        const script = "layoutContainer = document.getElementById('layout-container'), layoutContainer.addEventListener('tab-dropped', (CustomEvent) => {window.layoutContainerResult = CustomEvent.detail })"
        await WebDriver.executeAsync(script);
        await sideMenuIns.dragViewToWin()
       await WebDriver.sleep(2000);
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => console.log(result));
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => expect(result).toBeDefined);
        await WebDriver.waitForObjectExisting("window.layoutContainerResult").then(result => expect(test(result)).toEqual("https://cdn.openfin.co/embed-web/chart.html"));
  
    });


    it.skip('Close app', async () => {
        await WebDriver.switchToWindow('title', "Platform Window Template");
        await WebDriver.callMethod('fin.desktop.System.exit', undefined, false);
        await WebDriver.sleep(2000);  // pause here to give Runtime time to exit
    });
    