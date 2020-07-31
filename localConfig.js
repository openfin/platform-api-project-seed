const fs = require('fs');

const appJson = 'static/app.json';
const oldLocalJson = 'local.json';
const localJson = 'static/local.json';

if (fs.existsSync(oldLocalJson)) {
    console.log('Copying old local config to static dir.\n./local.json may now be deleted.')
    const manifest = require(`./${appJson}`);
    fs.writeFileSync(localJson, JSON.stringify(manifest, null, 4));

}

// If user supplied a version argument, create a new local.json file
if (process.argv.length > 2) {
    console.log('writing local config');
    const manifest = require(`./${appJson}`);
    const runtimeVersion = process.argv[2];

    manifest.runtime.version = runtimeVersion;
    fs.writeFileSync(localJson, JSON.stringify(manifest, null, 4));
}

// If local.json exists, use it instead of app.json
const manifestFile = fs.existsSync(localJson) ? localJson : appJson;
