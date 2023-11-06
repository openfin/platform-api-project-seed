import {  WebDriver, OpenFinProxy } from '@openfin/automation-helpers';
import OpenFin from '@openfin/core';
//import { expect } from 'chai';
import { topMenu } from '../../Menus/topMenuItems'
//import { Platform } from 'openfin/_v2/api/platform/platform';
const topMenuIns = new topMenu();
import { sideMenu } from '../../Menus/sideMenuItems'
const sideMenuIns = new sideMenu();

const rules:OpenFin.DefaultDomainSettings = {
    "rules": [
      {
        "match": [
          "*://file-examples.com/*",
          "*://filesamples.com/*",
          "*://sample-videos.com/*",
          "http://localhost:3000/*"
        ],
        "options": {
          "downloadSettings": {
            "rules": [
              {
                "match": [
                  "*://*/*.svg",
                  "*://*/*.jpg"
                ],
                "behavior": "no-prompt"
              },
              {
                "match": [
                  "<all_urls>"
                ],
                "behavior": "prompt"
              }
            ]
          }
        }
      }
    ]
}

describe('Health Check page', function() {
    const healthCheckTitle = 'http://localhost:3000/platform-window';

    it(`Switch to ${healthCheckTitle}`, async () => {
        await WebDriver.waitForWindow('url', healthCheckTitle, 5000);
        const title = await WebDriver.getUrl();
        expect(title).toBe(healthCheckTitle);
        //assert.(title,  healthCheckTitle);
    });

    it('validate runtime status and version', async () => {
        await WebDriver.sleep(5000)
        await topMenuIns.validateRuntimeStatus("33.116.77.11");
    });


    it('Wait for OpenFin API ready', async () => {
        const healthCheckTitle = 'http://localhost:3000/platform-window';
        await WebDriver.switchToWindow('url', healthCheckTitle);
        await WebDriver.waitForObjectExisting('fin.desktop', 5000);
        await topMenuIns.clickToggleSidebar();
        await sideMenuIns.clickDownloadapi()
        const fin = await OpenFinProxy.fin();
        const win = fin?.Window.getCurrent();
       (await win)?.maximize()
    });

    it('C24870 - FAIL - validate when setDomainSettings View is true in app manifest file, and DefaultDomainSettings doesnot exist add new one using fin.System.setDomainSettings(domainRule)', async () => {
        const healthCheckTitle = 'http://localhost:3000/views/download-api';
        await WebDriver.switchToWindow('url', healthCheckTitle);
        await WebDriver.waitForObjectExisting('fin.desktop', 5000);
        const fin = await OpenFinProxy.fin();
        let ds = await fin?.System.getDomainSettings();
        console.log(ds?.rules)
        expect(ds).toBeNull();
        await fin?.System.setDomainSettings(rules);
        ds = await fin?.System.getDomainSettings();
        expect(ds?.rules).toEqual(rules.rules)
    });

    it('Close app', async () => {
      await WebDriver.switchToWindow('title', "Platform Window Template");
      await WebDriver.callMethod('fin.desktop.System.exit', undefined, false);
      await WebDriver.sleep(2000);  // pause here to give Runtime time to exit
    });


});