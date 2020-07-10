var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        title: 'my_platform_notes'
    }
];
fin.Platform.init({
    overrideCallback: (Provider) => __awaiter(void 0, void 0, void 0, function* () {
        class Override extends Provider {
            getSnapshot() {
                const _super = Object.create(null, {
                    getSnapshot: { get: () => super.getSnapshot }
                });
                return __awaiter(this, void 0, void 0, function* () {
                    const snapshot = yield _super.getSnapshot.call(this);
                    //we add an externalWindows section to our snapshot
                    const externalWindows = yield generateExternalWindowSnapshot(externalWindowsToTrack);
                    return Object.assign(Object.assign({}, snapshot), { externalWindows });
                });
            }
            applySnapshot({ snapshot, options }) {
                const _super = Object.create(null, {
                    applySnapshot: { get: () => super.applySnapshot }
                });
                return __awaiter(this, void 0, void 0, function* () {
                    const originalPromise = _super.applySnapshot.call(this, { snapshot, options });
                    //if we have a section with external windows we will use it.
                    if (snapshot.externalWindows) {
                        yield Promise.all(snapshot.externalWindows.map((i) => __awaiter(this, void 0, void 0, function* () { return yield restoreExternalWindowPositionAndState(i); })));
                    }
                    return originalPromise;
                });
            }
        }
        ;
        return new Override();
    })
});
