async function getExternalWindowByNameTitle(name, title) {
    const externalWindows = await fin.System.getAllExternalWindows();
    const externalWin = externalWindows.find(w => (w.name === name && w.title == title));
    if (externalWin) {
        return await fin.ExternalWindow.wrap(externalWin);
    } else {
        return void 0;
    }
}

async function getExternalWindowInfo(name, title) {
    const exWin = await getExternalWindowByNameTitle(name, title);

    if (exWin) {
        return await exWin.getInfo();
    } else {
        return void 0;
    }
}

async function generateExternalWindowSnapshot(externalWins) {
    return await Promise.all(externalWins.map(async (i) => await getExternalWindowInfo(i.name, i.title)));
}

async function restoreExternalWindowPositionAndState(info) {
    const exWin = await getExternalWindowByNameTitle(info.name, info.title);
    if (exWin) {
        const bounds = Object.assign({top: info.bounds.y, left: info.bounds.x}, info.bounds);
        if (info.maximized) {
            await exWin.maximize();
        } if (info.minimized) {
            await exWin.minimize();
        } if (!info.maximized && !info.minimized) {
            await exWin.restore();
        }
        await exWin.setBounds(bounds);
    }
}

//We have customized out platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        title: 'my_platform_notes - Notepad'
    }
];
export default (Provider) => {
    return class ExternalWindowOverride extends Provider {
        async getSnapshot() {
            const snapshot = await super.getSnapshot();

            //we add an externalWindows section to our snapshot
            const externalWindows = await generateExternalWindowSnapshot(externalWindowsToTrack);
            return {
                ...snapshot,
                externalWindows
            };
        }

        async applySnapshot({ snapshot, options }) {

            const originalPromise = super.applySnapshot({ snapshot, options });

            //if we have a section with external windows we will use it.
            if (snapshot.externalWindows) {
                await Promise.all(snapshot.externalWindows.map(async (i) => await restoreExternalWindowPositionAndState(i)));
            }

            return originalPromise;
        }
    };
}