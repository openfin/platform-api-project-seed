
import { checkForFinsProtocol, checkEndpoints, Endpoint, EndpointStatus, OpenFinEndpoint } from '@openfin/deployment';

function addEndpointItem(resultsDiv: HTMLElement, status: EndpointStatus) {
    const li = document.createElement('li');
    li.setAttribute('id', `url_${status.id}`);
    const led = document.createElement('led');
    li.appendChild(led);
    const msg = document.createElement('span');
    msg.setAttribute('title', status.url);
    msg.innerHTML = `${status.displayName} (${status.success?'success':'fail'})`;
    li.appendChild(msg);
    resultsDiv.appendChild(li);
}

window.addEventListener("DOMContentLoaded",  async () => {

    const finsProtocolResult = await checkForFinsProtocol();
    const finsProtocolResultElm = document.getElementById('checkForFinsProtocol');
    if (finsProtocolResultElm) {
        finsProtocolResultElm.innerText = JSON.stringify(finsProtocolResult);
    }

    // check all OpenFin endpoints, excluding OpenFinEndpoint.Diagnostics
    const endpointCheckResult = await checkEndpoints([OpenFinEndpoint.Diagnostics]);
    const endpointCheckResultElm = document.getElementById('endpointChecks');
    if (endpointCheckResultElm) {
        endpointCheckResult.forEach((status) => addEndpointItem(endpointCheckResultElm, status))
    }

    // check should fail for the following endpoint because of CORS policy
    const customEndpoints:Endpoint[] = [
        {
            id: 'OpenFin Website',
            url: 'https://openfin.co',
            displayName: 'OpenFin Website'
        }
    ];
    const customResult = await checkEndpoints([], customEndpoints);
    const customCheckResultElm = document.getElementById('customEndpointChecks');
    if (customCheckResultElm) {
        customResult.forEach((status) => addEndpointItem(customCheckResultElm, status))
    }

});