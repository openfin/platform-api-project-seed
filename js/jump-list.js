import { getTemplates, getTemplateByName } from './template-store.js';

const SNAPSHOT_STORE_KEY = 'SnapshotForm';

export const setWorkspaces = () => {
    const allTemplates = getTemplates(SNAPSHOT_STORE_KEY);

    let workspacesAsJumpListConfig = allTemplates.map(({name}) => ({
        type: 'task',
        title: name,
        description: `Launches the ${name} workspace.`,
        deepLink: `fin://localhost:5555/app.json?$$workspace=${name}`
    }));

    const tasks = [
        {
            type: 'task',
            title: 'Launch',
            description: `Launches the default workspace.`,
            deepLink: `fin://localhost:5555/app.json`,
        }, 
        { type: 'separator' },
        {
            type: 'task',
            title: 'Launch minimized',
            description: `Launches the default workspace minimized.`,
            deepLink: `fin://localhost:5555/app.json?$$minimized=true`
        }
    ];

    const tools = [
        {
            type: 'task',
            title: 'Tool A',
            description: `Launches tool A.`,
            deepLink: `fin://localhost:5555/app.json`
        }, 
        {
            type: 'task',
            title: 'Tool B',
            description: `Launches tool B.`,
            deepLink: `fin://localhost:5555/app.json`
        }, 
    ];

    const jumpListConfig = [
        { // defaults to tasks
            items: tasks
        },
        {
            name: 'Workspaces',
            items: workspacesAsJumpListConfig
        },
        {
            name: 'Tools',
            items: tools
        }
    ];

    fin.Application.getCurrentSync().setJumpList(jumpListConfig);
}

export const setupLaunchListeners = snapshotOverrideCb => {
    const app = fin.Application.getCurrentSync();

    const applySnapshotFromTemplate = templateName => {
        const template = getTemplateByName(SNAPSHOT_STORE_KEY, templateName);

        return fin.Platform.getCurrentSync().applySnapshot(template.snapshot, {
            closeExistingWindows: template.close
        });
    }

    app.on('run-requested', event => {
        if(event.userAppConfigArgs['workspace']) {
            console.log('trying to apply snapshot');
            applySnapshotFromTemplate(event.userAppConfigArgs['workspace']);
        }
    });

    fin.desktop.main(function(args) { 
        if(args && args['workspace']) {
            snapshotOverrideCb(getTemplateByName(SNAPSHOT_STORE_KEY, args['workspace']).snapshot);
        }
    });
}

