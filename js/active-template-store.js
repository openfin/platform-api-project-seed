const STORE_UPDATED_TOPIC = `store:updated-${fin.me.identity.uuid}`;

//no need to send any data, we just want to notify other windows so they can re-render
async function publishUpdateEvents() {
    return fin.InterApplicationBus.publish(STORE_UPDATED_TOPIC, '');
}

//templates need to have a name { name:"", ... }
function storeActiveTemplate(templateStoreKey, template) {
    const storedTemplates = getActiveTemplates(templateStoreKey);
    const storedTemplateIndex = storedTemplates.findIndex(i => i.name === template.name);
    if (storedTemplateIndex !== -1) {
        storedTemplates[storedTemplateIndex] = template;
    } else {
        storedTemplates.push(template);
    }
    localStorage.setItem(templateStoreKey, JSON.stringify(storedTemplates));
    //Delete this
    publishUpdateEvents();
}

//Either returns a list of templates or an empty array.
function getActiveTemplates(templateStoreKey) {
    const storedTemplates = localStorage.getItem(templateStoreKey);
    let storedTemplatesArr;
    if (storedTemplates) {
        storedTemplatesArr = Array.from(JSON.parse(storedTemplates));
    } else {
        storedTemplatesArr = [];
    }

    return storedTemplatesArr;
}


function getActiveTemplateByName(templateStoreKey, name) {
    const templates = getActiveTemplates(templateStoreKey);
    const template = templates.find(i => i.name === name);
    return template;
}

//no concept of unsubcribing from these events.
function onActiveStoreUpdate(fn) {
    fin.InterApplicationBus.subscribe({ uuid: '*' }, STORE_UPDATED_TOPIC, fn);
}

export { storeActiveTemplate, getActiveTemplates, getActiveTemplateByName, onActiveStoreUpdate };
