onmessage = (msgEvt) => {
    let data = msgEvt.data;
    let ajax = data.ajax;
    let id = data.id;
    makeRequest(ajax)
        .then((xhrData) => {
        let ajaxReq = {
            method: ajax.method.toUpperCase(),
            requestUrl: xhrData.xhr.responseURL,
            responseType: xhrData.xhr.responseType,
            status: xhrData.xhr.status,
            statusText: xhrData.xhr.statusText,
            withCredentials: xhrData.xhr.withCredentials,
            response: xhrData.xhr.response,
            payload: ajax.payload,
            params: ajax.params
        };
        let responseObj = {
            ajaxReq: ajaxReq,
            id: id,
            idKey: data.idKey
        };
        postMessage(responseObj, responseObj.aBuf);
    })
        .catch((err) => {
        throw new Error(err);
    });
};
function makeRequest(ajax) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = ajax.responseType || 'json';
        xhr.open(ajax.method, ajax.url, true);
        xhr.onload = function (evt) {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ xhr: xhr, response: xhr.response });
            }
            else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        let payloadReqs = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (payloadReqs.indexOf(ajax.method) > -1) {
            xhr.send(ajax.payload);
        }
        else {
            xhr.send();
        }
    });
}

//# sourceMappingURL=now-context-worker.js.map
