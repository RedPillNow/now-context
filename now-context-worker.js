onmessage = (msgEvt) => {
    let data = msgEvt.data;
    let detail = data.detail;
    makeRequest(data.type.toUpperCase(), detail.ajax.url, 'json')
        .then((xhrData) => {
        let ajax = {
            method: data.type.toUpperCase(),
            requestUrl: xhrData.xhr.responseURL,
            responseType: xhrData.xhr.responseType,
            status: xhrData.xhr.status,
            statusText: xhrData.xhr.statusText,
            withCredentials: xhrData.xhr.withCredentials,
            response: xhrData.xhr.response,
            payload: detail.ajax.payload,
            params: detail.ajax.params
        };
        let responseObj = {
            ajax: ajax,
            detail: detail
        };
        postMessage(responseObj, responseObj.aBuf);
    })
        .catch((err) => {
        throw new Error(err);
    });
};
function makeRequest(method, url, responseType) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = responseType || 'json';
        xhr.open(method, url, true);
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
        xhr.send();
    });
}

//# sourceMappingURL=now-context-worker.js.map
