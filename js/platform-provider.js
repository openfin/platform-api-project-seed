import { generateExternalWindowSnapshot, restoreExternalWindowPositionAndState } from './external-window-snapshot.js';

//We have customized our platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        // Note that this is only the beginning of the title.
        // In `getExternalWindowByNameTitle`, we will just check that the title starts with this string.
        // This is in order to work with both 'my_platform_notes' and 'my_platform_notes.txt', depending on
        // the user's settings for viewing file extensions.
        title: 'my_platform_notes',
        launch: {
            _path: `C:\\Users\\rdepena\\Desktop\\my_platform_notes.txt`,
            alias: 'my_platform_notes',
            lifetime: 'window',
            arguments: ''
        }
    }
];

const externalWindowsLaunched = [];

fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
            async getSnapshot() {
                const snapshot = await super.getSnapshot();
                const appInfo = await fin.Application.getCurrentSync().getInfo();
                const nativeApplications = appInfo.manifest.platform.customData.nativeApplications;

                //we add an externalWindows section to our snapshot
                const externalWindows = await generateExternalWindowSnapshot(nativeApplications);
                return {
                    ...snapshot,
                    externalWindows
                };
            }

            async applySnapshot({ snapshot, options }) {

                const originalPromise = super.applySnapshot({ snapshot, options });

                //if we have a section with external windows we will use it.
                if (snapshot.externalWindows) {
                    await restoreExternalWindowPositionAndState(snapshot.externalWindows);
                }

                return originalPromise;
            }
        };
        return new Override();
    }
});


//Hacky way of launching apps and keeping track of them for snapshot purposes:
const bc = new BroadcastChannel('external-window-snapshot-tracker');
bc.addEventListener('message', e => {

    console.log(e.data);
    externalWindowsLaunched.push(e.data);
    console.log(externalWindowsLaunched);
});
