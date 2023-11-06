
import {  WebDriver, OpenFinProxy } from '@openfin/automation-helpers';
//import { expect } from 'chai';
import { topMenu } from './Menus/topMenuItems'
//import { Platform } from 'openfin/_v2/api/platform/platform';
const topMenuIns = new topMenu();
import { sideMenu } from './Menus/sideMenuItems'
const sideMenuIns = new sideMenu();


// declare var fin:any;

describe('Click Re-Run button in Health Check page', function() {
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

        it('Click launch assests view', async () => {
            await WebDriver.sleep(3000)
            await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
            await topMenuIns.clickToggleSidebar();
            await topMenuIns.verifyShowSideBar();
            await sideMenuIns.clickLaunchAssets();
        });

        it("launch external process - notepad", async () => {
            const healthCheckTitle = 'OpenFin Template';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({path:'notepad'})
            expect(result.uuid).toBeDefined()

            
        });

        it("launch external process - interop", async () => {
            const healthCheckTitle = 'OpenFin Template';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({alias:'winform-interop-example'}) 
            expect(result.uuid).toBeDefined()

            
        });

        it("launch external process - cwdTest", async () => {
            const healthCheckTitle = 'OpenFin Template';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({alias:'cwdTest'}) 
            expect(result.uuid).toBeDefined();
            
        });

        it("launch external process - download csv file", async () => {
            await WebDriver.switchToWindow('title', 'Platform Window Template');
            //const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('url', 'http://localhost:5555/index-copy.html');
            await WebDriver.sleep(5000)
            const bttnClick = await WebDriver.findElementByPath("//a[@id='csvfile']");
            await bttnClick.click()
            await WebDriver.sleep(2000)
           //await WebDriver.executeAsync("arguments[0].click()")
            await sideMenuIns.save()
            await sideMenuIns.saveConfirm()
            const fin = await OpenFinProxy.fin();
           const platform = await fin.Platform.getCurrent();
           platform.closeView(fin.me.identity);


        });

        it.skip("launch external process - download JSRuler", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const bttnClick = await WebDriver.findElementById('ruler');
            expect(bttnClick).toBeDefined;
            await bttnClick?.click()
           await WebDriver.sleep(2000)
           await sideMenuIns.save()
           await sideMenuIns.saveConfirm()

           const fin = await OpenFinProxy.fin();
           const platform = await fin.Platform.getCurrent();
           platform.closeView(fin.me.identity);
           
        });


        it('Click launch assests Window', async () => {
            await WebDriver.sleep(3000)
            await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
            await topMenuIns.verifyShowSideBar();
            await sideMenuIns.clickLaunchAssetsWindow();
        });

        it("launch external process - notepad", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({path:'notepad'})
            expect(result.uuid).toBeDefined()

            
        });

        it("launch external process - interop", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({alias:'winform-interop-example'}) 
            expect(result.uuid).toBeDefined()

            
        });

        it("launch external process - cwdTest", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({alias:'cwdTest'}) 
            expect(result.uuid).toBeDefined()
            
        });

        it("launch external process - download csv file", async () => {
            await WebDriver.switchToWindow('title', 'OpenFin Template File download');
            await WebDriver.sleep(5000)
            const bttnClick = await WebDriver.findElementByPath("//a[@id='csvfile']");
            await bttnClick.click()
            await WebDriver.sleep(2000)
           //await WebDriver.executeAsync("arguments[0].click()")
            await sideMenuIns.save()
            await sideMenuIns.saveConfirm()


        });

        it("launch external process - download JSRuler", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const bttnClick = await WebDriver.findElementById('ruler');
            expect(bttnClick).toBeDefined;
            await bttnClick?.click()
           await WebDriver.sleep(2000)
           await sideMenuIns.save()
           await sideMenuIns.saveConfirm()
           
        });

    });

