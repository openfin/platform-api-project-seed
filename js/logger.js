export default class Logger {
    constructor() {
        this.timeBaseline = Date.now();
        this.entities = [{topic: 'logger-started', time: 0}];
    }
    push(topic, payload, description) {
        let identity
        if(payload) {
            identity = JSON.stringify(payload.identity || {uuid: payload.uuid || '', name: payload.name || ''});
        } else {
            identity = 'N/A';
        }
        const entity = {time: Date.now() - this.timeBaseline, topic, identity, payload: JSON.stringify(payload) || '', description: description || ''};
        this.entities.push(entity);
    }

    log(logLevel) {
        if(!logLevel) logLevel = 0;

        switch(logLevel) {
            case 0: {
                console.table(this.entities.map(({time, topic}) => ({time, topic}))); // basic
                break;    
            }
            case 1: {
                console.table(this.entities); //robust
            }
        }
    }
}