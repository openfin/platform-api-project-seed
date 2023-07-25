
import {  WebDriver, OpenFinProxy } from '@openfin/automation-helpers';
//import { expect } from 'chai';
import { topMenu } from './Menus/topMenuItems'
//import { Platform } from 'openfin/_v2/api/platform/platform';
const topMenuIns = new topMenu();



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


       

        it("LayoutsAPI - apply a new layout", async () => {
            const healthCheckTitle = 'OpenFin Deployment Health Check';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            //const platform = fin.Platform.getCurrentSync();
            const layout = await fin.Platform.Layout.wrapSync({uuid: 'platform_customization_local', name: 'Seed Window'});
            const newLayout = {
                "content": [
                    {
                        "type": "column",
                        "content": [
                            {
                                "type": "component",
                                "componentName": "view",
                                "height": 17,
                                "componentState": {
                                    "title": "component1",
                                    "name": "component1",
                                    "url": "http://google.com"
                                }
                            },
                            {
                                "type": "row",
                                "content": [
                                    {
                                        "type": "stack",
                                        "width": 33,
                                        "content": [
                                            {
                                                "type": "component",
                                                "componentName": "view",
                                                "componentState": {
                                                    "title": "component2",
                                                    "name": "component2",
                                                    "url": "http://cnn.com"
                                                }
                                            },
                                            {
                                                "type": "component",
                                                "componentName": "view",
                                                "componentState": {
                                                    "title": "component3",
                                                    "name": "component3",
                                                    "url": "http://nba.com"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "type": "stack",
                                        "content": [
                                            {
                                                "type": "component",
                                                "componentName": "view",
                                                "componentState": {
                                                    "title": "component4",
                                                    "name": "component4",
                                                    "url": "http://bing.com"
                                                }
                                            },
                                            {
                                                "type": "component",
                                                "componentName": "view",
                                                "componentState": {
                                                    "title": "component5",
                                                    "name": "component5",
                                                    "url": "http://yahoo.com"
                                                }
                                            },
                                            {
                                                "type": "component",
                                                "componentName": "view",
                                                "componentState": {
                                                    "title": "component6",
                                                    "name": "component6",
                                                    "url": "http://npr.com"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            await layout.replace(newLayout);
            
        });

        it("LayoutsAPI - getViews()", async () => {
            const healthCheckTitle = 'Bing';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            //const platform = await OpenFinProxy.build<>("fin", []);
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();
            const response = await targetStack.getViews();
            expect(response.length).toEqual(3);

            console.log((await targetStack.getViews()))
            
        });


        it("LayoutsAPI - addViews()", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            //const platform = await OpenFinProxy.build<>("fin", []);
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();
            await targetStack.addView({uuid: fin.me.uuid, name: 'sibling-view', url: 'https://nba.com' } );
            await targetStack.addView({uuid: fin.me.uuid, name: 'sibling-view2', url: 'https://cdn.openfin.co/health/deployment/index.html' } );
            const response2 = await targetStack.getViews();
            expect(response2.length).toEqual(3);
            
        });

        it("LayoutsAPI - removeViews()", async () => {
            const healthCheckTitle = 'OpenFin Deployment Health Check';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            //const platform = await OpenFinProxy.build<>("fin", []);
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();
            await targetStack.removeView({uuid: fin.me.uuid, name: 'sibling-view' } );;
            const response2 = await targetStack.getViews();
            expect(response2.length).toEqual(2);
            
        });

        it("LayoutsAPI - setActiveView", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            await WebDriver.sleep(5000)
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'component4', uuid: 'platform_customization_local' });
            const targetStack = await view.getCurrentStack();         
            const response2 = await targetStack.getViews();
            expect(response2.length).toBeGreaterThanOrEqual(3);
            await targetStack.setActiveView({name: 'component5', uuid: 'platform_customization_local' })
            await targetStack.setActiveView({name: 'component6', uuid: 'platform_customization_local' })
            await targetStack.setActiveView({name: 'component4', uuid: 'platform_customization_local' })
            
        });

        it("LayoutsAPI - createAdjacentStack - top", async () => {
            const healthCheckTitle = 'Bing';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            await targetStack.createAdjacentStack([{url:'https://www.google.com', name:'my-google'}], {position:'top'})
        });

        it("LayoutsAPI - createAdjacentStack - bottom", async () => {
            const healthCheckTitle = 'Bing';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            await targetStack.createAdjacentStack([{url:'https://www.google.com', name:'my-google-bottom'}], {position:'bottom'})
        });

        it("LayoutsAPI - createAdjacentStack - left", async () => {
            const healthCheckTitle = 'Bing';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            await targetStack.createAdjacentStack([{url:'https://www.google.com', name:'my-google-left'}], {position:'left'})
        });

        it("LayoutsAPI - createAdjacentStack - right", async () => {
            const healthCheckTitle = 'Bing';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            await targetStack.createAdjacentStack([{url:'https://www.google.com', name:'my-google-right'}], {position:'right'})
        });

        it("LayoutsAPI - createAdjacentStack - on rootItem", async () => {
            const healthCheckTitle = 'Platform Window Template';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const s1 = await fin.Platform.Layout.getCurrentSync()
            const s = await s1.getRootItem()
            await s.createAdjacentStack([{url:'https://www.google.com', name:'my-google1'}], {position:'top'})
            await s.createAdjacentStack([{url:'https://www.google.com', name:'my-google2'}], {position:'bottom'})
            await s.createAdjacentStack([{url:'https://www.google.com', name:'my-google3'}], {position:'right'})
            await s.createAdjacentStack([{url:'https://www.google.com', name:'my-google4'}], {position:'left'})
        });


        it("LayoutsAPI - getAdjacentStacks - top", async () => {
            const healthCheckTitle = 'Breaking News, Latest News and Videos | CNN';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            const adjacentStacks = await targetStack.getAdjacentStacks('top');
            console.log(adjacentStacks)
            expect(adjacentStacks).toBeDefined();
            expect(adjacentStacks.length).toEqual(1);


        });

        it("LayoutsAPI - getAdjacentStacks - bottom", async () => {
            const healthCheckTitle = 'Breaking News, Latest News and Videos | CNN';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            const adjacentStacks = await targetStack.getAdjacentStacks('bottom');
            console.log(adjacentStacks)
            expect(adjacentStacks).toBeDefined();
            expect(adjacentStacks.length).toEqual(1);


        });

        it("LayoutsAPI - getAdjacentStacks - left", async () => {
            const healthCheckTitle = 'Breaking News, Latest News and Videos | CNN';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            const adjacentStacks = await targetStack.getAdjacentStacks('left');
            console.log(adjacentStacks)
            expect(adjacentStacks).toBeDefined();
            expect(adjacentStacks.length).toEqual(1);


        });

        it("LayoutsAPI - getAdjacentStacks - right", async () => {
            const healthCheckTitle = 'Breaking News, Latest News and Videos | CNN';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const name1 = await fin.me.name
            const view = await fin.View.wrap({ name: name1, uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            const adjacentStacks = await targetStack.getAdjacentStacks('right');
            console.log(adjacentStacks)
            expect(adjacentStacks).toBeDefined();
            expect(adjacentStacks.length).toEqual(3);

        });


        it("LayoutsAPI - getAdjacentStacks - top - empty", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'my-google1', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            const adjacentStacks = await targetStack.getAdjacentStacks('top');
            console.log(adjacentStacks)
            expect(adjacentStacks).toStrictEqual([])
            expect(adjacentStacks.length).toEqual(0);
        });

        it("LayoutsAPI - getAdjacentStacks - bottom - empty", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'my-google2', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            const adjacentStacks = await targetStack.getAdjacentStacks('bottom');
            console.log(adjacentStacks)
            expect(adjacentStacks).toStrictEqual([])
            expect(adjacentStacks.length).toEqual(0);
        });

        it("LayoutsAPI - getAdjacentStacks - left - empty", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'my-google4', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            const adjacentStacks = await targetStack.getAdjacentStacks('left');
            console.log(adjacentStacks)
            expect(adjacentStacks).toStrictEqual([])
            expect(adjacentStacks.length).toEqual(0);
        });

        it("LayoutsAPI - getAdjacentStacks - right - empty", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'my-google3', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            const adjacentStacks = await targetStack.getAdjacentStacks('right');
            console.log(adjacentStacks)
            expect(adjacentStacks).toStrictEqual([])
            expect(adjacentStacks.length).toEqual(0);
        });


        it("LayoutsAPI - FAIL -  getViews - on a stack destroyed", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'my-google1', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            await targetStack.removeView({ name: 'my-google1', uuid: fin.me.uuid })
            const response = await targetStack.getViews();
            expect(response).toThrowError();
        });

        it("LayoutsAPI - FAIL -  addViews - on a stack destroyed", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'my-google2', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();   
            await targetStack.removeView({ name: 'my-google2', uuid: fin.me.uuid }) 
            await targetStack.addView({uuid: fin.me.uuid, name: 'sibling-view', url: 'https://www.openfin.co/' } );
            const response = await targetStack.getViews();
            expect(response).toThrowError();
        });

        it("LayoutsAPI - FAIL -  setActive - on a stack destroyed", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'sibling-view2', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();   
            await targetStack.removeView({ name: 'sibling-view2', uuid: fin.me.uuid }) 
            await targetStack.removeView({ name: 'component1', uuid: fin.me.uuid }) 
            await targetStack.setActiveView({name: 'sibling-view2', uuid: 'platform_customization_local' })
            const response = await targetStack.getViews();
            expect(response).toThrowError();
        });


        it("LayoutsAPI - FAIL -  removeViews - on a stack destroyed", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'my-google3', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            await targetStack.removeView({ name: 'my-google3', uuid: fin.me.uuid })
            await targetStack.removeView({ name: 'my-google3', uuid: fin.me.uuid })
            const response = await targetStack.getViews();
            expect(response).toThrowError();
        });

        it("LayoutsAPI - FAIL -  createAdjacentStack - on a stack destroyed", async () => {
            const healthCheckTitle = 'Google';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'my-google4', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();    
            await targetStack.removeView({ name: 'my-google4', uuid: fin.me.uuid })
            await targetStack.createAdjacentStack([{url:'https://www.google.com', name:'my-google1-FAIL'}], {position:'top'})
            const response = await targetStack.getViews();
            expect(response).toThrowError();
        });


        it("LayoutsAPI - isRoot, exists, getParent, getContent on View", async () => {
            const healthCheckTitle = 'The official site of the NBA for the latest NBA Scores, Stats & News. | NBA.com';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const view = await fin.View.wrap({ name: 'component3', uuid: fin.me.uuid });
            const targetStack = await view.getCurrentStack();  
            expect(await targetStack.isRoot()).toBeTruthy()
            expect(await targetStack.exists()).toBeTruthy()
            expect(await targetStack.getParent()).toBeDefined()
            console.log(await targetStack.isRoot())
            console.log(await targetStack.exists())
            console.log(await targetStack.getParent())
        });

        it("LayoutsAPI - isRoot, exists, getParent, getContent on fin.Platform.Layout", async () => {
            const healthCheckTitle = 'Seed Window';
            await WebDriver.switchToWindow('title', healthCheckTitle);
            const fin = await OpenFinProxy.fin();
            const layout = await fin.Platform.Layout.wrapSync({uuid: 'platform_customization_local', name: 'Seed Window'});
            const targetStack = await layout.getRootItem()
            expect(await targetStack.isRoot()).toBe(true)
            expect(await targetStack.exists()).toBeTruthy()
            //expect(await targetStack.getParent()).toBeDefined()
            console.log(await targetStack.isRoot())
            console.log(await targetStack.exists())
            console.log(await targetStack.getParent())
        });

    });

