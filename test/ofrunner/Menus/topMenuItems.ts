
import {  OpenFinSystem, WebDriver, OpenFinProxy } from '@openfin/automation-helpers';
class topMenu {

    get whiteTheme () {return ('//html[contains(@class, "light-theme")]')};
    get blackTheme () {return ('//html[contains(@class, "")]')};
    get leftmenuItems () {return ('//div[@id="body-container"]/left-menu[contains(@class, "")]')}
    get leftmenuHidden () {return ('//div[@id="body-container"]/left-menu[contains(@class, "hidden")]')}
    get lockView () {return ('//div[contains(@class, "button layout-locked")]')}
    get unlockView () {return ('//div[contains(@class, "button")]')}


 // Click theme on top menu bar   
 async clickTheme(){
    const toggleTheme = await WebDriver.findElementById('theme-button');
    expect(toggleTheme).toBeDefined
    toggleTheme?.click();
}
// Verify light theme applied  
 async verifyWhiteTheme() {
    const lightTheme = await WebDriver.findElementsByPath(this.whiteTheme);
    expect(lightTheme).toBeDefined
    await WebDriver.sleep(1000);
}
// Verify dark theme applied  
 async VerifyBlackTheme() {
    const darkTheme = await WebDriver.findElementsByPath(this.blackTheme);
    expect(darkTheme).toBeDefined
    await WebDriver.sleep(1000);
}
// Click Toggle side bar on top menu  
 async clickToggleSidebar(){
    const toggleSidebarButton = await WebDriver.findElementById('menu-button');
    toggleSidebarButton.click();
}
// Verify Side menu opens
 async verifyShowSideBar() {
    const leftMenu = await WebDriver.findElementsByPath(this.leftmenuItems);
    expect(leftMenu).toBeDefined
    await WebDriver.sleep(1000);
}
// Verify Side menu is closed
 async verifyNoSideBar() {
    const noLeftMenu = await WebDriver.findElementsByPath(this.leftmenuHidden);
    expect(noLeftMenu).toBeDefined
    await WebDriver.sleep(1000);
}
// click Lock button on top menu
 async clickLock(){
    const toggleLock = await WebDriver.findElementById('lock-button');
    toggleLock.click();
}
// verify lock is applied to the views
 async verifyLockViews() {
    const locked = await WebDriver.findElementsByPath(this.lockView);
    expect(locked).toBeDefined
    await WebDriver.sleep(1000);
}
// Verify views are unlocked
 async verifyUnLockViews() {
    const unlocked = await WebDriver.findElementsByPath(this.unlockView);
    expect(unlocked).toBeDefined
    await WebDriver.sleep(1000);
}

// Verify click Lock button on top menu
async clickExpandWindow(){
    const toggleLock = await WebDriver.findElementById('expand-button');
    toggleLock.click();
}

async validateRuntimeStatus(expectedRuntime: any) {
        await OpenFinSystem.waitForReady(10000);
        const fin = await OpenFinProxy.fin();
        const version = await fin.System.getVersion();
        expect(expectedRuntime).toBe(version);
};

async clickMinimizeWindow(){
    const toggleLock = await WebDriver.findElementById('minimize-button');
    toggleLock.click();
    await WebDriver.sleep(1000)
    await WebDriver.saveScreenshot()
    // await WebDriver.callMethod('Window.show', undefined, false);
    // await WebDriver.sleep(2000); 
}

}

export {topMenu}