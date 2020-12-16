import { generateExternalWindowSnapshot, restoreExternalWindowPositionAndState } from './external-window-snapshot.js';
import * as jumpList from './jump-list.js';
//We have customized our platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        // Note that this is only the beginning of the title.
        // In `getExternalWindowByNameTitle`, we will just check that the title starts with this string.
        // This is in order to work with both 'my_platform_notes' and 'my_platform_notes.txt', depending on
        // the user's settings for viewing file extensions.
        title: 'my_platform_notes'
    }
];


// ** jumplist logic ** //
let snapshotOverride = undefined;
const setSnapshotOverride = snapshot => snapshotOverride = snapshot;
jumpList.setupLaunchListeners(setSnapshotOverride);
jumpList.setWorkspaces();
// ** end jumplist logic ** //

fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
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
                let originalPromise;
                if(snapshotOverride) {
                    originalPromise = super.applySnapshot({ snapshot: snapshotOverride, options });
                    snapshotOverride = undefined; // we only want to do this on the first apply snapshot
                } else {
                    originalPromise = super.applySnapshot({ snapshot, options });
                }

                //if we have a section with external windows we will use it.
                if (snapshot.externalWindows) {
                    await Promise.all(snapshot.externalWindows.map(async (i) => await restoreExternalWindowPositionAndState(i)));
                }

                return originalPromise;
            }
        };
        return new Override();
    }
});
