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
        xhr.withCredentials = ajax.withCredentials || false;
        let url = ajax.params ? getParamsUrl(ajax.url, ajax.params) : ajax.url;
        xhr.open(ajax.method, url, true);
        if (ajax.userAuthorizationString) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(ajax.userAuthorizationString));
        }
        if (ajax.headers) {
            for (let key in ajax.headers) {
                xhr.setRequestHeader(key, ajax.headers[key]);
            }
        }
        xhr.onload = function (evt) {
            if (xhr.status >= 200 && xhr.status < 400) {
                resolve({ xhr: xhr, response: xhr.response });
            }
            else if (xhr.status === 0 || xhr.status >= 500) {
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
function getParamsUrl(url, params) {
    let returnVal = url;
    if (params) {
        let count = -1;
        for (let key in params) {
            if (count === -1) {
                returnVal += '?';
            }
            else {
                returnVal += '&';
            }
            returnVal += key + '=' + params[key];
            count = count + 1;
        }
        returnVal = encodeURI(returnVal);
    }
    return returnVal;
}
//# sourceMappingURL=now-context-worker.js.map