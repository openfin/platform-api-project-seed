import {  WebDriver, OpenFinProxy } from '@openfin/automation-helpers';
import OpenFin from '@openfin/core';
import { topMenu } from '../../Menus/topMenuItems'
const topMenuIns = new topMenu();
import { sideMenu } from '../../Menus/sideMenuItems'
const sideMenuIns = new sideMenu();
import * as fs from 'fs/promises'
import * as fs2 from 'fs'
import fileName from 'C:/Core/Core-102323/core/manual-test-platform/public/platform_local_old_single_layout.json'
import {series} from 'async';
import {exec} from 'child_process';


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

    it('C24865 - validate when setDomainSettings View is true in app manifest file, able to update rules for DefaultDomainSettings', async () => {
        const healthCheckTitle = 'http://localhost:3000/views/download-api';
        await WebDriver.switchToWindow('url', healthCheckTitle);
        await WebDriver.waitForObjectExisting('fin.desktop', 5000);
        const fin = await OpenFinProxy.fin();
        let ds = await fin?.System.getDomainSettings();
        console.log(ds?.rules)
        expect(ds).toBeDefined();
        await fin?.System.setDomainSettings(rules);
        ds = await fin?.System.getDomainSettings();
        expect(ds?.rules).toEqual(rules.rules)
    });

    it('C24868 - validate when setDomainSettings(view) is true in app manifest file, update the prompt for domain rule', async () => {
      await WebDriver.waitForObjectExisting('fin.desktop', 5000);
      const fin = await OpenFinProxy.fin();
      const domainRules = await fin?.System.getDomainSettings();
      await sideMenuIns.clickCarButton();
      await sideMenuIns.clickVercelButton();
      domainRules.rules[0].options.downloadSettings.rules[0].behavior = 'prompt';
      await fin?.System.setDomainSettings(domainRules);
      await sideMenuIns.clickCarButton();
      await sideMenuIns.save()
      await sideMenuIns.saveConfirm()
      await sideMenuIns.clickVercelButton();
      await sideMenuIns.save()
      await sideMenuIns.saveConfirm()
      const path = "C:/Users/pgoll/Downloads/"
      let fileN = "car.jpg"
      if(fs2.existsSync(path + fileN)){
        console.log('exist')
        let stats = fs2.statSync(path + fileN);
        let mtime = stats.mtime;
        let dt = mtime.toLocaleDateString()
        const today = new Date()
        expect(today.toLocaleDateString()).toEqual(dt)
      }
      else{
          console.log('does not exist')
      }
      fileN = "vercel.svg"
      if(fs2.existsSync(path + fileN)){
        console.log('exist')
        let stats = fs2.statSync(path + fileN);
        let mtime = stats.mtime;
        let dt = mtime.toLocaleDateString()
        const today = new Date()
        expect(today.toLocaleDateString()).toEqual(dt)
      }
      else{
          console.log('does not exist')
      }


  });

  it('Update platform local app json to setDomainSettings = false', async () => {
    const path = "C:/Core/Core-102323/core/manual-test-platform/public/platform_json_error.json"
    await WebDriver.sleep(5000)
    fileName.platform.permissions.System.setDomainSettings = false;
    fileName.platform.defaultViewOptions.permissions.System.setDomainSettings = false;
    fileName.platform.defaultWindowOptions.permissions.System.setDomainSettings = false;
    fs.writeFile(path, JSON.stringify(fileName))
});

it('Update platform local app json to setDomainSettings = null', async () => {
  const path = "C:/Core/Core-102323/core/manual-test-platform/public/platform_json_error2.json"
  await WebDriver.sleep(5000)
  delete fileName.platform.permissions.System.setDomainSettings;
  delete fileName.platform.defaultViewOptions.permissions.System.setDomainSettings;
  delete fileName.platform.defaultWindowOptions.permissions.System.setDomainSettings;
  fs.writeFile(path, JSON.stringify(fileName))
});

it('Update platform local app json to defaultDomainSettings = null', async () => {
  const path = "C:/Core/Core-102323/core/manual-test-platform/public/platform_json_empty_DomainSettings.json"
  await WebDriver.sleep(5000)
  delete fileName.platform.defaultDomainSettings;
  fs.writeFile(path, JSON.stringify(fileName))
});

it('Run a build in Core folder', async () => {
  const path = "C:\Core\core\manual-test-platform"
  await WebDriver.sleep(5000)
  series([
    () => exec('cd ' + path),
    () => exec('npm run build')
   ]); 
});

it('Close app', async () => {
  await WebDriver.switchToWindow('title', "Platform Window Template");
  await WebDriver.callMethod('fin.desktop.System.exit', undefined, false);
  await WebDriver.sleep(2000);  // pause here to give Runtime time to exit
});

});