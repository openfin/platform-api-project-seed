import { NWIClient } from './nwi-lib.js';
let nwiClient = new NWIClient("nwi:snapshot:provider"); 

fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
            async getSnapshot() {
                const snapshot = await super.getSnapshot();
                const appInfo = await fin.Application.getCurrentSync().getInfo();
                const nativeApplications = appInfo.manifest.platform.customData.nativeApplications;

                //we add an externalWindows section to our snapshot
                const nwiFragment = await nwiClient.getSnapshotFragment(nativeApplications);

                return {
                    ...snapshot,
                    nwiFragment
                };
            }

            async applySnapshot({ snapshot, options }) {

                const originalPromise = super.applySnapshot({ snapshot, options });

                //if we have a section with external windows we will use it.
                if (snapshot.nwiFragment) {
                    try {
                        //await restoreExternalWindowPositionAndState(snapshot.externalWindows);
                        //should we send our configuration so that we don't launch anything that has not been configured.
                        //  This will involve fixing the issue in the .NET adapter where we cannot pass channel API connection arguments.
                        //should the NWI-Provider only send back a snapshot ID.
                        await nwiClient.applySnapshotFragment(snapshot.nwiFragment);
                    } catch (err) {
                        console.error(err);
                    }
                }

                return originalPromise;
            }
        };
        return new Override();
    }
});