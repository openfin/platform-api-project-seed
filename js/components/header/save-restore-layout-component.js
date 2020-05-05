import { html, render } from 'https://unpkg.com/lit-html@1.0.0/lit-html.js';
import { isLayoutLocked } from '../../layout-locking.js';
import hostViewContainer from '../../host-view-container.js';

class SaveRestoreLayoutComponent extends HTMLElement {

    constructor() {
        super();
        this.render = this.render.bind(this);
        this._viewContainerOptions = {};
        this.render();
    }

    saveLockStatus(isLocked) {
        sessionStorage.setItem(fin.me.identity.name + '-locked', isLocked);
    }

    async saveWindowLayout() {
        let winLayout;
        let winLayoutConfig;

        try {
            console.log("About to capture and stored the current window layout.");
            winLayout = fin.Platform.Layout.getCurrentSync();
            winLayoutConfig = await winLayout.getConfig();
            sessionStorage.setItem(fin.me.identity.name, JSON.stringify(winLayoutConfig));
            this._viewContainerOptions = hostViewContainer.getAllOptions();
            console.log("Captured and stored the current window layout.");
            this.render();
        } catch (err) {
            console.error("Error trying to capture the layout of this window.", err);
        }

    }

    async restoreWindowLayout() {
        const storedWinLayout = sessionStorage.getItem(fin.me.identity.name);
        if (storedWinLayout) {
            let winLayout = JSON.parse(storedWinLayout);
            let isWinLayoutLocked = await isLayoutLocked(winLayout);
            this.saveLockStatus(isWinLayoutLocked);
            await fin.Platform.Layout.getCurrentSync().replace(winLayout);

            // if the view tab example view exists on this window we wish to re-apply any changes that were present
            if(this._viewContainerOptions !== undefined) {
                setTimeout(()=> {
                    console.log("Trying to restore view container settings");
                    // because we tie into the tab created event elsewhere we will need to wait a while before applying the captured snapshot
                    hostViewContainer.updateAllOptions(this._viewContainerOptions);
                }, 500);
            }
        } else {
            throw new Error("No snapshot found in sessionstorage");
        }
    }

    async render() {
        const saveRestoreLayout = html`

        <div class="button" style='height:unset'  title='Save this window layout' @click=${async () => this.saveWindowLayout().catch(console.error)}>💾</div>
        ${ sessionStorage.getItem(fin.me.identity.name) !== null ? html`
        <div class="button" style='height:unset' title='Restore this window layout' @click=${async () => this.restoreWindowLayout().catch(console.error)}>📂</div>`
        : html``}
      `;
        return render(saveRestoreLayout, this);
    }
}

customElements.define('save-restore-layout', SaveRestoreLayoutComponent);
