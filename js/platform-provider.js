import { generateExternalWindowSnapshot, restoreExternalWindowPositionAndState } from './external-window-snapshot.js';

//We have customized out platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        title: 'my_platform_notes - Notepad'
    }
];

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

                const originalPromise = super.applySnapshot({ snapshot, options });

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
