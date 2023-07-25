
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
            await topMenuIns.validateRuntimeStatus("33.116.77.2");
        });



        it('Wait for OpenFin API ready', async () => {
            await WebDriver.waitForObjectExisting('fin.desktop', 5000);
        });

        it('Toggle side bar', async () => {
            await WebDriver.sleep(3000)
            await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
            await topMenuIns.clickToggleSidebar();
            await topMenuIns.verifyShowSideBar();

        });


        it('Click launch assests Window', async () => {
            await WebDriver.sleep(3000)
            await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
            await topMenuIns.verifyShowSideBar();
            await sideMenuIns.clickLaunchAssetsWindow();
        });

        it("PASS - launch external process - notepad", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({path:'notepad'})
            expect(result.uuid).toBeDefined()

            
        });

        it("FAIL - launch external process - notepad", async () => {
 
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({path:'notepad.exe'})
            expect(() => result.uuid).toThrow('Runtime Error');

            
        });

        it("PASS - launch external process - notepad", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({path:'c:/windows/system32/notepad.exe'})
            expect(result.uuid).toBeDefined()

            
        });

        it("PASS - launch external process - interop", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({alias:'winform-interop-example'}) 
            expect(result.uuid).toBeDefined()

            
        });

        it("FAIL - launch external process - cwdTest", async () => {
            const healthCheckTitle = 'OpenFin Template File download';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const result = await fin.System.launchExternalProcess({alias:'cwdTest'}) 
            expect(result).toThrowError()
            
        });


    });

