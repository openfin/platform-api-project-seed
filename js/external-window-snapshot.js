function wait(t) {
    return new Promise(resolve => {
        setTimeout(resolve, t);
    });
}
function lowerStartsWith(a, b) {
    return a.toLocaleLowerCase().startsWith(b.toLocaleLowerCase());
}

async function getExternalWindowsByNameTitle(name, title) {
    const externalWindows = await fin.System.getAllExternalWindows();
    // Using `startsWith` to account for the fact that window titles may or may not include
    // file extensions, depending on user settings.
    return await Promise.all(
        externalWindows.filter(ew => (lowerStartsWith(ew.name, name) && lowerStartsWith(ew.title, title)))
            .map((ew) => {
                ew.uuid = void 0;
                return fin.ExternalWindow.wrap(ew);
            }));
}

//Object shape for TS later:
//externalWindowConfig
// [{
//     name: string,
//     title: string, 
//     launch: ExternalProcessRequestType - https://cdn.openfin.co/docs/javascript/19.89.58.7/global.html#ExternalProcessRequestType
// }]
/// Object externalWindowInfo:
//[{
//     name: string,
//     nativeId: string,
//     process: { injected: boolean, pid: number, imageName: string},
//     title: string,
//     visible: boolean,
//     uuid: string
//     alwaysOnTop: boolean,
//     bounds: { x: number, y: number, width: number, height: number},
//     className: string,
//     dpi: number,
//     dpiAwareness: number,
//     focused: boolean,
//     maximized: boolean,
//     minimized: boolean
//}]
//returns { config: externalWindowConfig, info: ExternalWindowInfo[]}
async function generateSnapshotFragment(configurations) {
    const externalWindows = await fin.System.getAllExternalWindows();

    //filter allExternal Windows.
    return await Promise.all(configurations.map(async (config) => {
        //TODO: optimization cache the externalWindows source.
        const wrappedInstances = await getExternalWindowsByNameTitle(config.name, config.title);
        const info = await Promise.all(wrappedInstances.map((wi) => wi.getInfo()));

        return {
            config,
            info
        };
    }));
}

//snapshotFragement: { config: externalWindowConfig, info: ExternalWindowInfo[]}
async function restoreExternalWindowPositionAndState(snapshotFragment) {
    const matchedWindows = await matchWindows(snapshotFragment);
    //console.log(matchedWindows);

    //TODO: flow errors back.
    return Promise.all(matchedWindows.map(async (m) => {
        await restore(m.restoreList);
        await reLaunch(m.config, m.missingList);
    }));
}

async function restore(restoreList) {
    restoreList.forEach(async ({activeWindow, snapshotInfo} ) => {
        const exWin = await fin.ExternalWindow.wrap(activeWindow);
        if (exWin) {
            const bounds = Object.assign({top: snapshotInfo.bounds.y, left: snapshotInfo.bounds.x}, snapshotInfo.bounds);
            if (snapshotInfo.maximized) {
                await exWin.maximize();
            } if (snapshotInfo.minimized) {
                await exWin.minimize();
            } if (!snapshotInfo.maximized && !snapshotInfo.minimized) {
                await exWin.restore();
            }
            await exWin.setBounds(bounds);
        }
    });
}

async function reLaunch(config, missingList) {
    const restoreList = await Promise.all(missingList.map(async (m) => {

        const procIdentity = await fin.System.launchExternalProcess(config.launch);
        //we return an object that is compatible with restore
        //TODO: Change restore to accept a list of {identity, info}
        return {
            activeWindow: procIdentity,
            snapshotInfo: m
        };
    }));
    //we need to re-run the match algo here.
    //Looks like excel locks up if I restore it after launching. Could be we have the wrong window. for sure a bug:
    //Investigate this https://gitlab.com/openfin/core/-/blob/develop/src/browser/api/external_window.ts#L296
    restore(restoreList);
}

export { generateSnapshotFragment, restoreExternalWindowPositionAndState };


//pseudocode for Restoring a given snapshot:

//Step 1: given an array of snapshotFragement: {
//    config: externalWindowConfig,
//    info: ExternalWindowInfo[]
// } obtain the current desktop state filtered by the externalWindowConfig
//returns:
// snapshotFragmentWithDesktopState extends snapshotFragement {
// desktopState: ExternalWindowInfo[]
//}
//async function getCurrentDesktopState(externalWindowSnapshot) {
//}

//Step 2: given a snapshotFragmentWithDesktopState will return a matched
// will return matchedState extends snapshotFragmentWithDesktopState {
// snapshotFragement: snapshotFragement[],
// matched: ExternalWindowInfo[],
// unmatched: ExternalWindowInfo[],
// reminder: ExtXernalWindowInfo[],
//}
//async function matchWindows(snapshotFragmentWithDesktopState) {
    //pseudocode
    //matched = matching entities where desktopState:ExternalWindowInfo matched by ids for snapshotFragement:info
    //unmatchedDesktop = desktopState - matched // Windows on the desktop that match a given rule but not the id's
    //unmatchedSnapshot =  snapshotFragement - matched //Windows on the snapshot that do not match any window on the desktop by Id
//};

//here we will need to make some choices, we will either launch or adopt existing windows.
// async function guestimate(unmatchedDesktop, unmatchedSnapshot) {
//     if (unmatchedDesktop.length === unmatchedSnapshot.length) {
//         //Happy path for the unhappy path, means we have the same number of entries.
//         //Action: we can restore the windows in any order (opinionated default).

//     } else if (unmatchedDesktop.length > unmatchedSnapshot.length) {
//         //We have more desktop window instances that the snapshot accounted for.
//         //Action: we can ignore the remaining windows after appliying the same matching logic as the code block above.

//     } else if (unmatchedSnapshot.length > unmatchedDesktop.length) {
//         //We have more windows defined in the snapshot than windows found in the desktop
//         //Action: Apply same matching logic as the code above, then call out for launch -> this is pending.
//     }
// }

async function matchWindows(externalWindowSnapshotFragment) {

    //Step 1: given an array of snapshotFragement: {
    //    config: externalWindowConfig,
    //    info: ExternalWindowInfo[] //This is a bad name.
    // } obtain the current desktop state filtered by the externalWindowConfig
    //returns:
    // snapshotFragmentWithDesktopState extends snapshotFragement {
    // desktopState: ExternalWindowInfo[]
    //}
    const snapshotFragmentWithDesktopState = await Promise.all(externalWindowSnapshotFragment.map(async (i) => {
        //TODO: change this logic to get name + title from the snapshot info.
        const wrappedInstances = await getExternalWindowsByNameTitle(i.config.name, i.config.title);
        const info = await Promise.all(wrappedInstances.map((wi) => wi.getInfo()));

        i.desktopState = info;
        return i;
    }));

    //Step 2:
    return Promise.all(snapshotFragmentWithDesktopState.map(async(s) => {

        const matched = s.info.filter((i) => s.desktopState.find(w => (w.nativeId === i.nativeId)));
        const unmatchedDesktop = s.desktopState.filter(i => matched.find(w => (w.nativeId === i.nativeId)) === void 0);
        const unmatchedSnapshot = s.info.filter(i => matched.find(w => (w.nativeId === i.nativeId)) === void 0);
        let missingList = [];


        s.matched = matched;
        s.unmatchedDesktop = unmatchedDesktop;
        s.unmatchedSnapshot = unmatchedSnapshot;

        let restoreList;

        if (unmatchedDesktop.length === unmatchedSnapshot.length) {
            //Happy path for the unhappy path, means we have the same number of entries.
            //Action: we can restore the windows in any order (opinionated default).

            restoreList = unmatchedDesktop.map((w, idx) => {
                return {
                    activeWindow: w,
                    snapshotInfo: unmatchedSnapshot[idx]
                };
            });

        } else if (unmatchedDesktop.length > unmatchedSnapshot.length) {
            //We have more desktop window instances that the snapshot accounted for.
            //Action: we can ignore the remaining windows after appliying the same matching logic as the code block above.
            //reverse the desktopArray so we pick up older window's first.
            unmatchedDesktop.reverse();
            restoreList = unmatchedSnapshot.map((w, idx) => {
                return {
                    activeWindow: unmatchedDesktop[idx],
                    snapshotInfo: w
                };
            });

        } else if (unmatchedSnapshot.length > unmatchedDesktop.length) {
            //We have more windows defined in the snapshot than windows found in the desktop
            //Action: Apply same matching logic as the code above, then call out for launch -> this is pending.
            restoreList = unmatchedDesktop.map((w, idx) => {
                return {
                    activeWindow: w,
                    snapshotInfo: unmatchedSnapshot[idx]
                };
            });
            missingList = unmatchedSnapshot.slice(restoreList.length, unmatchedSnapshot.length);
        }

        //let's make sure we also add the matched set.
        s.restoreList = restoreList.concat(matched.map(snapshotInfo => {
            const activeWindow = s.desktopState.find(w => (w.nativeId === snapshotInfo.nativeId));

            return {
                activeWindow,
                snapshotInfo
            };
        }));

        s.missingList = missingList;

        //TODO: add missing windows so we can launch them.
        return s;
    }));
}
