const OpenFinPinger = {
    loadURLs: async () => {
        const resp = await fetch('urls.json');
        const urlList = await resp.json();
        return urlList.urls;
    },
    phoneHome: async (addItem, itemStatusHandler) => {
        const urls = await OpenFinPinger.loadURLs();
        urls.forEach((urlInfo, idx) => {
            addItem(idx, urlInfo)
            OpenFinPinger.ping(idx, urlInfo, itemStatusHandler);
        });

    },
    ping: async (idx, urlInfo, urlHandler) => {
        try {
            const resp = await fetch(urlInfo.href);
            if (!resp.ok) {
                urlHandler(idx, false, `${resp.statusText} - ${resp.statusText$}`);
                return;
            }

            let v = '';
            const ct = resp.headers.get("content-type");
            if (ct && ct.indexOf("application/json") !== -1) {
                const j = await resp.json();
                if (j.private) {
                    v = `${j.private.version} (${j.private.sha})`;
                } else if (j.projectVersion) {
                    v = j.projectVersion;
                } else if (j.revision) {
                    v = `${j.version} (${j.revision})`
                } else {
                    v = j.version;
                }
            } else {
                v = await resp.text();
            }
            urlHandler(idx, true, Object.assign(urlInfo, { version: v }));
        } catch(e) {
            urlHandler(idx, false, e);
        }
    },
    pingManifest: async (manifest, manifestHandler, appHandler) => {
        try {
            const purl = new URL(manifest);
            const resp = await fetch(purl.href);
            if (!resp.ok) {
                manifestHandler({ status: 'error', msg: `error loading manifest, response: ${resp.status}`, url: purl.href});
                return;
            }

            const j = await resp.json();    
            let appURL = '', appName = '', msg = '';
            if (j.startup_app && j.startup_app.url) {
                appURL = j.startup_app.url;
                appName = j.startup_app.name || j.startup_app.uuid;
                msg = `manifest ${appName} OK`;
            } else if (j.platform) {
                appURL = j.platform.url;
                appName = j.platform.name;
                msg = `manifest ${appName} OK`;
            } else {
                manifestHandler({ status: 'error', msg: `manifest error, unable to locate app url`, url: purl.href});
            }
            manifestHandler({ status: 'ok', msg: msg, url: purl.href});
            OpenFinPinger.pingAppURL(appName, appURL, appHandler)
        } catch(e) {
            manifestHandler({ status: 'error', msg: `error loading manifest, response: ${e}`, url: manifest});
        }
    },
    pingAppURL: async (appName, appURL, appHandler) => {
        try {
            const surl = new URL(appURL);
            const resp = await fetch(surl.href, {mode: 'no-cors'});
            if (resp.ok) {
                appHandler({ status: 'ok', msg: `app ${appName} OK`, url: surl.href });
                return;
            }
        } catch(e) {
            appHandler({ status: 'error', msg: `app ${appName} ERROR: ${e}`, url: appURL });
            return;
        }
        appHandler({ status: 'error', msg: `app ${appName} ERROR`, url: appURL });
    }
}