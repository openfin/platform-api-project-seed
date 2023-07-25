

import {  WebDriver, WebDriverKeys } from '@openfin/automation-helpers';
import {mouse,centerOf, Region, straightTo, Key, keyboard, left, right, down, up } from '@nut-tree/nut-js'

class sideMenu {

    get oFChart () {return ('//button[contains(text(), "OF Chart")]')};
    get tradeView () {return ('//button[contains(text(), "TradeView")]')};
    get news () {return ('//button[contains(text(), "News")]')};
    get colors () {return ('//button[contains(text(), "Colors")]')};
    get docs () {return ('//button[contains(text(), "Documentation")]')};
    get healthCheck () {return ('//button[contains(text(), "Health check")]')};
    get Fdl () {return ('//button[contains(text(), "File download")]')};


    get platformWindow () {return ('//button[contains(text(), "Platform Window")]')};
    get ofWindow () {return ('//button[contains(text(), "OF Window")]')};
    get FdWin () {return ('//button[contains(text(), "File Download")]')};

    get grid () {return ('//button[contains(text(), "Grid")]')};
    get tab () {return ('//button[contains(text(), "Tab")]')};
    get clone () {return ('//button[contains(text(), "Clone")]')};
    get saveLayOut () {return ('//button[@class="layout-button"]')};

    get saveSnapshot () {return ('//button[@class="snapshot-button"]')};


//  Click on OF chart button on Side menubar
async clickoFChart(){
    const bttnClick = await WebDriver.findElementByPath(this.oFChart);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}
// Verify OF chart View opened
async verifyoFChartViewOpened(){
    await this.clickViewTab("OpenFin Template")
    await this.verifyOFChartOpened(); 
}
// Verify OF chart View opened Detail checks
async verifyOFChartOpened(){
    await WebDriver.sleep(1000)
     await WebDriver.switchToWindow("url", "https://cdn.openfin.co/embed-web/chart.html");
     const chart = await WebDriver.findElementByPath('//div[@class="container-fluid"]//div[@id="chart"]')
     expect(chart).toBeDefined;
     const indicator = await WebDriver.findElementByPath('//div[@id="status-indicator"][@class="online"]')
     expect(indicator).toBeDefined;
     
}
// Click on Views based on title, also verifies view tab is active
async clickViewTab(title: string){
    const tab = await WebDriver.findElementByPath(`//li[contains(@title, "${title}")]`)
    expect(tab).toBeDefined;
    await tab?.click()
    const attr = await tab.getAttribute("class")
    expect(attr).toContain("lm_active")
    await this.verifyOFChartOpened(); 
}

// Close View Tab
async closeViewTab(title: string){
    const tab = await WebDriver.findElementByPath(`//li[contains(@title, "${title}")]`)
    expect(tab).toBeDefined;
    await tab?.click();
    const attr = await tab.getAttribute("class");
    expect(attr).toContain("lm_active");
    const close = await WebDriver.findElementByCssSelector('li.lm_tab.lm_active.focused_tab>div.lm_close_tab')
    expect(close).toBeDefined;
    await close?.click() 
}


// Click on Tradeview button on Side menubar
async clickTradeView(){
    const bttnClick = await WebDriver.findElementByPath(this.tradeView);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(3000)
}
// Verify TradeView opened
async verifyTradeViewOpened(){
    await this.clickViewTab("AAPL")
    await this.verifyTradeViewViewOpened(); 
}
// VerifyTradeView opened Detail checks
async verifyTradeViewViewOpened(){
    await WebDriver.sleep(4000)
    const wins = await WebDriver.getWindows();
    for (const element of wins) {
        const id = element.url;
        //console.log(id);
        if (id.includes("https://www.tradingview.com/"))
        {
            //console.log("yes it is! :)", id.name)
            await WebDriver.switchToWindow('handle', element.handle);
            const chart = await WebDriver.findElementByPath('//body[@class="chart-page unselectable i-no-scroll"]')
            expect(chart).toBeDefined;
            await chart?.click()  
            break;
        }
    };
       
}


// Click on News button on Side menubar
async clickNews(){
    const bttnClick = await WebDriver.findElementByPath(this.news);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click();
   await WebDriver.sleep(3000)
}

// Verify News View opened
async verifyNewsOpened(){
    await this.clickViewTab("INDEXDJX:")
    await this.verifyNewsViewOpened(); 
}
// Verify News View opened Detail checks
async verifyNewsViewOpened(){
    await WebDriver.sleep(4000)
    const wins = await WebDriver.getWindows();
    for (const element of wins) {
        const id = element.url;
        //console.log(id);
        if (id.includes("https://www.google.com/search?q=INDEXDJX"))
        {
            //console.log("yes it is! :)", id.name)
            await WebDriver.switchToWindow('handle', element.handle);
            const chart = await WebDriver.findElementByPath('//input[@name="q"][@value="INDEXDJX: .DJI"]');
            expect(chart).toBeDefined;
            await chart?.click()  
            break;
        }
    };  
}

//

// Click on Colors button on Side menubar
async clickColors(){
    const bttnClick = await WebDriver.findElementByPath(this.colors);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}

// Verify View name is Document
async verifyColorsOpened(){
    await this.clickViewTab("Document")
}
//Verify Colors View opened Detail and color is the chosen color checks
async verifyColorsViewOpened(colorSelected: string){
    await WebDriver.sleep(1000)
    await WebDriver.switchToWindow("url", "http://localhost:5555/color-view.html");
     const chart = await WebDriver.findElementByPath('//input[@placeholder="Enter color"]')
     expect(chart).toBeDefined;
     await chart?.click() 
     await chart.sendKeys(colorSelected)  ;
     const bttn = await WebDriver.findElementByPath('//button[@action="submit"]')
     expect(bttn).toBeDefined;
     await bttn?.click() 
     const colorBg = await WebDriver.findElementByPath(`//body[contains(@style, ${colorSelected})]`)
     expect(colorBg).toBeDefined;
     await WebDriver.sleep(1000)
     
}

// Click on Documentation button on Side menubar
async clickDocs(){
    const bttnClick = await WebDriver.findElementByPath(this.docs);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}
// Verify Documentation View opened
async verifyDocsOpened(){
    await this.clickViewTab("OpenFin JavaScript API - Home")
    await this.verifyDocsViewOpened(); 
}
// Verify Documentation View opened Detail checks
async verifyDocsViewOpened(){
    await WebDriver.sleep(1000)
    await WebDriver.switchToWindow("url", "https://cdn.openfin.co/docs*");
     const text = await WebDriver.findElementByPath('//h3[contains(text(), "Namespaces")]')
     expect(text).toBeDefined;
     await text?.click()    
}

//

// Click on Health Check button on Side menubar
async clickHealthCheck(){
    const bttnClick = await WebDriver.findElementByPath(this.healthCheck);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}
// Verify Health Check View opened
async verifyHealthCheckOpened(){
    await this.clickViewTab("OpenFin Deployment Health Check")
    await this.verifyHealthCheckViewOpened(); 
}
// Verify Health Check View opened Details checks
async verifyHealthCheckViewOpened(){
    await WebDriver.sleep(1000)
    await WebDriver.switchToWindow("url", "https://cdn.openfin.co/health/deployment/index.html");
    const bttn = await WebDriver.findElementById("rerun");
     expect(bttn).toBeDefined;
     await bttn?.click()    
}



// Click on Grid button on Side menubar
async clickGridView(){
    const bttnClick = await WebDriver.findElementByPath(this.grid);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}
// Verify Grid layout class applied
async verifyViewsGridLayout(win: string){
   await WebDriver.sleep(2000)
    if (win === "window")
    {
        await WebDriver.switchToWindow("identityString", [/internal-generated-window(.*)/, "platform_customization_local"]);
    }
    else if (win==="view")
    {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
    }
     const view = await (await WebDriver.findElementByClass("lm_item lm_column"))
     expect(view).toBeDefined;
     await view?.click()  
     await WebDriver.sleep(2000)
     await WebDriver.saveScreenshot()
     
     //await this.getWindowsTest();
     
}
// Close Window
async closeWindow(){
    await WebDriver.switchToWindow("identityString", [/internal-generated-window(.*)/, "platform_customization_local"]);
    await WebDriver.sleep(5000)
    const wins = await WebDriver.getWindows();
        for (const element of wins) {
            const id = element;
            console.log("id is " + id.identity.name);
            if (id.identity.name.includes("internal-generated-window"))
            {
                //console.log("yes it is! :)", id.name)
                await WebDriver.switchToWindow('handle', element.handle);
                const close = await WebDriver.findElementById("close-button");
                await close?.click();
                break;
            }
        };
}



// Click on Tab button on Side menubar
async clickTabView(){
    const bttnClick = await WebDriver.findElementByPath(this.tab);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}
// Verify Tab layout class applied
async verifyViewsTabLayout(win: string){
   await WebDriver.sleep(2000)
    if (win === "window")
    {
        await WebDriver.switchToWindow("identityString", [/internal-generated-window(.*)/, "platform_customization_local"]);
    }
    else if (win==="view")
    {
        await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
    }
     const view = await WebDriver.findElementByClass("lm_item lm_stack")
     expect(view).toBeDefined;
     await view?.click()  
     await WebDriver.sleep(2000)
     await WebDriver.saveScreenshot()
     
}

// Click on Clone button on Side menubar
async clickClone(){
    const bttnClick = await WebDriver.findElementByPath(this.clone);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}

// Click on Save Layout button on Side menubar
async clickSaveLayout(){
    const bttnClick = await WebDriver.findElementByPath(this.saveLayOut);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}

// Enter layout name and Save layout
async enterLayoutInfo(name: string){
    await WebDriver.sleep(1000)
    await WebDriver.switchToWindow("url", "http://localhost:5555/platform-window.html");
    const inp = await WebDriver.findElementByPath('//input[@class="template-name"]');
    expect(inp).toBeDefined;
    await inp?.click();
    await inp.sendKeys(WebDriverKeys.Shift+WebDriverKeys.Home+WebDriverKeys.Delete);
    await inp.sendKeys(name)
    const bttn = await WebDriver.findElementByPath('//div[@class="center-form"]//button[contains(text(), "Save Layout")]');
    expect(bttn).toBeDefined;
    await bttn?.click()

}

//verify Layout Button name given is present and Apply Layout
async verifyLayout(name: string, layout: string){
    await WebDriver.sleep(1000)
    await WebDriver.switchToWindow("url", "http://localhost:5555/platform-window.html");
    const bttn = await WebDriver.findElementByPath(`//left-menu//button[contains(text(), "${name}")]`);
    expect(bttn).toBeDefined;
    await bttn?.click();
    await WebDriver.sleep(1000)
    //const view = await WebDriver.findElementByClass("lm_item lm_stack")
    const view = await WebDriver.findElementByClass(layout)
     expect(view).toBeDefined;
     await view?.click()  
     await WebDriver.sleep(2000)
     await WebDriver.saveScreenshot()
}


// Click on Save Snapshot button on Side menubar
async clickSaveSnapshot(){
    const bttnClick = await WebDriver.findElementByPath(this.saveSnapshot);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}

// Enter layout name and Save layout
async enterSnapShotInfo(name: string, closewin: string){
    await WebDriver.sleep(1000)
    await WebDriver.switchToWindow("url", "http://localhost:5555/platform-window.html");
    const inp = await WebDriver.findElementByPath('//input[@value="New Snapshot"]');
    expect(inp).toBeDefined;
    await inp?.click();
    await inp.sendKeys(WebDriverKeys.Shift+WebDriverKeys.Home+WebDriverKeys.Delete);
    await inp.sendKeys(name)
    if (closewin==="n")
    {
        const checkbox = await WebDriver.findElementByPath('//input[@type="checkbox"]');
        expect(checkbox).toBeDefined;
        await checkbox?.click();
        
    }
    const bttn = await WebDriver.findElementByPath('//div[@class="center-form"]//button[contains(text(), "Save Snapshot")]');
    expect(bttn).toBeDefined;
    await bttn?.click()
}

//verify Layout Button assigned is present and Apply Layout
async verifySnapshotWindow(name: string, layout: string, closewin: string){
    await WebDriver.sleep(1000)
    await WebDriver.switchToWindow("url", "http://localhost:5555/platform-window.html");
    const bttn = await WebDriver.findElementByPath(`//left-menu//button[contains(text(), "${name}")]`);
    expect(bttn).toBeDefined;
    await bttn?.click();
    await WebDriver.sleep(1000)

    if (closewin !=="n")
    {
        await WebDriver.switchToWindow("url", "http://localhost:5555/platform-window.html");
        const view = await WebDriver.findElementByClass(layout)
        expect(view).toBeDefined;
        await view?.click()  
        await WebDriver.sleep(2000)
        await WebDriver.saveScreenshot()
    }
    
}

// Click on Platform Window button on Side menubar
async clickPlatformWindow(){
    await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
    const bttnClick = await WebDriver.findElementByPath(this.platformWindow);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}

// Verify Platform Window View opened
async verifyPlatformWindowOpened(){
    await WebDriver.switchToWindow("identityString", [/internal-generated-window(.*)/, "platform_customization_local"]);
    await this.verifyoFChartViewOpened();
    await WebDriver.sleep(2000);    
}

// Click on OF Window button on Side menubar
async clickofWindow(){
    await WebDriver.switchToWindow('url', "http://localhost:5555/platform-window.html");
    const bttnClick = await WebDriver.findElementByPath(this.ofWindow);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click()
   await WebDriver.sleep(2000)
}

// Verify OF Window View opened
async verifyofWindowOpened(){
    await WebDriver.switchToWindow("identityString", [/internal-generated-window(.*)/, "platform_customization_local"]);
    await this.verifyOFChartOpened();
    let body = await WebDriver.findElementByTag("body");
    await body.click();
    await keyboard.pressKey(Key.LeftAlt, Key.F4);
    await keyboard.releaseKey(Key.LeftAlt, Key.F4);
    //await body.sendKeys(WebDriverKeys.Alt+WebDriverKeys.F4);
    await WebDriver.sleep(2000)
    // await mouse.move(
    //     straightTo(
    //         centerOf(
    //             new Region(0, 0, 10, 10)
    //         )
    //     )
    // );
    // await mouse.move(
    //     straightTo(
    //         centerOf(
    //             new Region(755, 215, 10, 10)
    //         )
    //     )
    // );
    //await mouse.leftClick();
    await WebDriver.sleep (2000)
    await WebDriver.switchToWindow("identityString", ["Seed Window", "platform_customization_local"]);
}

//Drag Window Right by 1000
async dragWindow(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(256, 10, 10, 10)
            )
        )
    );
    //mouse.pressButton(left)
    await mouse.drag(right(500))
}
//Refocus on a view
async refocus(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(256, 10, 10, 10)
            )
        )
    );
    await mouse.leftClick();
 }
// Drag View Right
 async dragViewRight(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(175, 38, 10, 10)
            )
        )
    );
    //mouse.pressButton(left)
    await mouse.drag(right(200))
}
// Drag View Left
async dragViewLeft(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(565, 500, 10, 10)
            )
        )
    );
    //mouse.pressButton(left)
    await mouse.drag(left(200))
}
// Drag View Down
async dragViewDown(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(565, 271, 10, 10)
            )
        )
    );
    //mouse.pressButton(left)
    await mouse.drag(down(200))
}
// Drag View Up
async dragViewUp(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(692, 504, 10, 10)
            )
        )
    );
    //mouse.pressButton(left)
    await mouse.drag(up(400))
}
// Drag View down in a Tabbed theme
async dragViewDownTab(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(186, 41, 10, 10)
            )
        )
    );
    //mouse.pressButton(left)
    await mouse.drag(down(400))
}
// Drag View Left in a Tabbed theme
async dragViewLeftTab(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(704, 43, 10, 10)
            )
        )
    );
    //mouse.pressButton(left)
    await mouse.drag(down(400))
}
// Drag View out into its own Window
async dragViewtoWindow(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(176, 46, 10, 10)
            )
        )
    );
    await mouse.drag(right(800))
}
// Drag Window into a View
async dragWindowToVIew(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(970, 46, 10, 10)
            )
        )
    );
    await mouse.move(
        straightTo(
            centerOf(
                new Region(1000, 25, 10, 10)
            )
        )
    );
    await mouse.drag(down(220))
    await mouse.move(
        straightTo(
            centerOf(
                new Region(1000, 265, 10, 10)
            )
        )
    );
    await mouse.drag(left(257))
}

// Resize eWindow
async resizeWindow(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(877, 708, 10, 10)
            )
        )
    );
    await mouse.drag(down(100))
}

async clickBody(){
    await WebDriver.switchToWindow('identityString', [/internal-generated-window(.*)/, 'platform_customization_local']);
    await this.verifyOFChartOpened();
    let body = await WebDriver.findElementByTag("body");
    await body.click();
}


async devtools(){
    await keyboard.pressKey(Key.LeftControl, Key.LeftShift, Key.I);
    await keyboard.releaseKey(Key.LeftControl, Key.LeftShift, Key.I);
}

async refreshCntrlR(){
    await keyboard.pressKey(Key.LeftControl, Key.R);
    await keyboard.releaseKey(Key.LeftControl, Key.R);
}

async refreshF5(){
    await keyboard.pressKey(Key.F5);
    await keyboard.releaseKey(Key.F5);
}

async zoomInCntrlPlus(num: number){
    
    for(let i=0; i<=num; i++)
    {
        await keyboard.pressKey(Key.LeftControl, Key.Add);
    }
    await keyboard.releaseKey(Key.LeftControl, Key.Add);
}

async zoomOutCntrlMinus(num: number){
    for(let i=0; i<=num; i++)
    {
        await keyboard.pressKey(Key.LeftControl, Key.Subtract);
    }
    await keyboard.releaseKey(Key.LeftControl, Key.Subtract);
}

async zoomReset(){
    await keyboard.pressKey(Key.LeftControl, Key.Num0);
    await keyboard.releaseKey(Key.LeftControl, Key.Num0);
}

async close(){
    await keyboard.pressKey(Key.LeftAlt, Key.F4);
    await keyboard.releaseKey(Key.LeftAlt, Key.F4);
}

async clickLaunchAssets(){
    const bttnClick = await WebDriver.findElementByPath(this.Fdl);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click();
   await WebDriver.sleep(3000)
}

async clickLaunchAssetsWindow(){
    const bttnClick = await WebDriver.findElementByPath(this.FdWin);
    expect(bttnClick).toBeDefined;
    await bttnClick?.click();
   await WebDriver.sleep(3000)
}

async save(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(820, 510, 5, 5)
            )
        )
    );
    await mouse.leftClick();
}

async saveConfirm(){
    await mouse.move(
        straightTo(
            centerOf(
                new Region(1020, 540, 5, 5)
            )
        )
    );
    await mouse.leftClick();
}

}

export {sideMenu}