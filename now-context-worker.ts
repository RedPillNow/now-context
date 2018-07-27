/**
 * The message listener. This is the entry point into
 * the worker and where all requests must start
 * @param {any} msgEvt
 * @property {any} msgEvt.data
 * @property {any} msgEvt.data.ajax The ajax properties to use for the request
 * @returns {any} returnObj
 * @listens message
 */
onmessage = (msgEvt) => {
	// console.log('now-context-worker.onmessage', msgEvt);
	let data = msgEvt.data;
	let ajax = data.ajax;
	let id = data.id;
	makeRequest(ajax)
		.then((xhrData) => {
			// console.log('worker.onmessage.then', xhrData);
			let ajaxReq: any = {
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
			let responseObj: any = {
				ajaxReq: ajaxReq,
				id: id,
				idKey: data.idKey
			}
			postMessage(responseObj, responseObj.aBuf);
		})
		.catch((err) => {
			throw new Error(err);
		});
}
/**
 * Makes a request to the server and returns a promise
 * @param {Now.AjaxRequest} ajax
 * @returns {Promise}
 */
function makeRequest(ajax): any {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		if (ajax.withCredentials && ajax.authorization) {
			xhr.setRequestHeader('Authorization', 'Basic ' + btoa(ajax.userAuthorizationString));
			xhr.withCredentials = true;
		}
		xhr.responseType = ajax.responseType || 'json';
		xhr.open(ajax.method, ajax.url, true);
		xhr.onload = function (evt: any) {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve({ xhr: xhr, response: xhr.response });
			} else {
				reject({
					status: xhr.status,
					statusText: xhr.statusText
				});
			}
		};
		let payloadReqs = ['POST', 'PUT', 'PATCH', 'DELETE'];
		if (payloadReqs.indexOf(ajax.method) > -1) {
			xhr.send(ajax.payload);
		} else {
			xhr.send();
		}
	});
}
