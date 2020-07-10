const STORE_UPDATED_TOPIC = `store:updated-${fin.me.identity.uuid}`;

//no need to send any data, we just want to notify other windows so they can re-render
async function publishUpdateEvents() {
    return fin.InterApplicationBus.publish(STORE_UPDATED_TOPIC, '');
}

//templates need to have a name { name:"", ... }
function storeTemplate(templateStoreKey, template) {
    const storedTemplates = getTemplates(templateStoreKey);
    storedTemplates.push(template);
    localStorage.setItem(templateStoreKey, JSON.stringify(storedTemplates));
    //Delete this
    publishUpdateEvents();
}

//Either returns a list of templates or an empty array.
function getTemplates(templateStoreKey) {
    const storedTemplates = localStorage.getItem(templateStoreKey);
    let storedTemplatesArr;
    if (storedTemplates) {
        storedTemplatesArr = Array.from(JSON.parse(storedTemplates));
    } else {
        storedTemplatesArr = [];
    }

    return storedTemplatesArr;
}


function getTemplateByName(templateStoreKey, name) {
    const templates = getTemplates(templateStoreKey);
    const template = templates.find(i => i.name === name);
    return template;
}

//no concept of unsubcribing from these events.
function onStoreUpdate(fn) {
    fin.InterApplicationBus.subscribe({ uuid: '*' }, STORE_UPDATED_TOPIC, fn);
}

export { storeTemplate, getTemplates, getTemplateByName, onStoreUpdate };
