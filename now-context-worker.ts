
/**
 * The message listener. This is the entry point into
 * the worker and where all requests must start
 * @param {any} msgEvt
 * @property {any} msgEvt.data
 * @property {string} msgEvt.data.type The type of request we're making
 * @property {string} msgEvt.data.url The URL to use for the request
 * @returns {any} returnObj
 * @property {string} returnObj.type The type of request this was (msgEvt.data.type)
 * @property {any} returnObj.response The response from the request
 * @listens message
 */
onmessage = (msgEvt) => {
	// console.log('now-context-worker.onmessage', msgEvt);
	let data = msgEvt.data;
	let detail = data.detail;
	makeRequest(data.type.toUpperCase(), detail.ajax.url, 'json')
		.then((xhrData) => {
			// console.log('worker.onmessage.then', xhrData);
			let ajax: any = {
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
			let responseObj: any = {
				ajax: ajax,
				detail: detail
			}
			postMessage(responseObj, responseObj.aBuf);
		})
		.catch((err) => {
			throw new Error(err);
		});
}
/**
 * Makes a request to the server and returns a promise
 * @param {string} method
 * @param {string} url
 * @param {string} responseType
 * @returns {Promise}
 */
function makeRequest(method: string, url: string, responseType?): any {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.responseType = responseType || 'json';
		xhr.open(method, url, true);
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
		xhr.send();
	});
}
