namespace Now {

	export class AjaxRequest {
		private _method: string;
		private _params: any;
		private _payload: any;
		private _response: any;
		private _responseType: string;
		private _requestUrl: string;
		private _status: number;
		private _statusText: string;
		private _withCredentials: boolean;

		get method() {
			return this._method;
		}

		set method(method) {
			this._method = method;
		}

		get params() {
			return this._params;
		}

		set params(params) {
			this._params = params;
		}

		get payload() {
			return this._payload;
		}

		set payload(payload) {
			this._payload = payload;
		}

		get response() {
			return this._response;
		}

		set response(response) {
			this._response = response;
		}

		get responseType() {
			return this._responseType;
		}

		set responseType(responseType) {
			this._responseType = responseType;
		}

		get requestUrl() {
			return this._requestUrl;
		}

		set requestUrl(requestUrl) {
			this._requestUrl = requestUrl;
		}

		get status() {
			return this._status;
		}

		set status(status) {
			this._status = status;
		}

		get statusText() {
			return this._statusText;
		}

		set statusText(statusText) {
			this._statusText = statusText;
		}

		get withCredentials() {
			return this._withCredentials;
		}

		set withCredentials(withCredentials) {
			this._withCredentials = withCredentials;
		}
	}

	export class ContextItem {
		private _element: any;
		private _id: string;
		private _idKey: string;
		private _lastAjaxRequest: Now.AjaxRequest;
		private _model: any;

		get element() {
			return this._element;
		}

		set element(element) {
			this._element = element;
		}

		get id() {
			if (this.model && !this._id) {
				this._id = this.model[this.idKey];
			}
			return this._id;
		}

		get idKey() {
			return this._idKey;
		}

		set idKey(idKey) {
			this._idKey = idKey;
		}

		get lastAjaxRequest() {
			return this._lastAjaxRequest;
		}

		set lastAjaxRequest(lastAjaxRequest) {
			this._lastAjaxRequest = lastAjaxRequest;
		}

		get model() {
			return this._model;
		}

		set model(model) {
			this._model = model;
		}
	}
}

namespace NowElements {

	/**
	 * Manage the context of an application. All XHR requests should pass through this element
	 *
	 * @author Keith Strickland <keith@redpillnow.com>
	 */
	@component('now-context')
	export class NowContext extends NowElements.BaseElement {
		/**
		 * The context Item. This is an object containing all the requests
		 * made
		 * @type {any}
		 */
		@property({
			type: Object,
			value: {},
			notify: true
		})
		context: any;

		attached() {
			// Create a global for interacting with this element
			window['NowContext'] = this;
		}
		/**
		 * Perform a GET request and return the promise
		 * @param {CustomEvent} evt
		 * @property {any} evt.detail
		 * @property {any} evt.detail.ajax
		 * @property {any} evt.detail.ajax.payload
		 * @property {any} evt.detail.ajax.parameters
		 * @property {string} evt.detail.ajax.contentType
		 * @property {string} evt.detail.ajax.handleAs
		 * @property {string} evt.detail.ajax.url
		 * @property {any} evt.detail.context
		 * @property {HTMLElement} evt.detail.context.element
		 * @property {any} evt.detail.context.model
		 * @listens iron-signal-nowcontextget
		 * @returns {Promise}
		 */
		onGetRequest(evt: CustomEvent) {
			let detail = evt.detail;
			// console.log(this.is, 'onGetRequest, detail=', detail);
			if (detail) {
				let ajax = this.$.getAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				return ajax.generateRequest().completes
					.then((ironRequest) => {
                        return this.updateContext(ironRequest, ajax, detail);
					})
					.catch((err) => {
						throw new Error(this.is + '.onGetRequest failed');
					});
			}else {
				throw new Error(this.is + ':iron-signal-nowcontextget: No detail provided in signal');
			}
		}
		/**
		 *
		 * @param {CustomEvent} evt
		 * @property {any} evt.detail
		 * @property {any} evt.detail.ajax
		 * @property {any} evt.detail.ajax.payload
		 * @property {any} evt.detail.ajax.parameters
		 * @property {string} evt.detail.ajax.contentType
		 * @property {string} evt.detail.ajax.handleAs
		 * @property {string} evt.detail.ajax.url
		 * @property {any} evt.detail.context
		 * @property {HTMLElement} evt.detail.context.element
		 * @property {any} evt.detail.context.model
		 * @listens iron-signal-nowcontextput
		 * @returns {Promise}
		 */
		onPutRequest(evt: CustomEvent) {
			let detail = evt.detail;
			if (detail) {
				let ajax = this.$.putAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				ajax.body = detail.ajax.payload;
				return ajax.generateRequest().completes;
			}else {
				throw new Error(this.is + ',nowcontextput: No detail provided in signal');
			}
		}
		/**
		 *
		 * @param {CustomEvent} evt
		 * @property {any} evt.detail
		 * @property {any} evt.detail.ajax
		 * @property {any} evt.detail.ajax.payload
		 * @property {any} evt.detail.ajax.parameters
		 * @property {string} evt.detail.ajax.contentType
		 * @property {string} evt.detail.ajax.handleAs
		 * @property {string} evt.detail.ajax.url
		 * @property {any} evt.detail.context
		 * @property {HTMLElement} evt.detail.context.element
		 * @property {any} evt.detail.context.model
		 * @listens iron-signal-nowcontextpost
		 * @returns {Promise}
		 */
		onPostRequest(evt: CustomEvent) {
			let detail = evt.detail;
			if (detail) {
				let ajax = this.$.postAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				ajax.body = detail.ajax.payload;
				return ajax.generateRequest().completes;
			}else {
				throw new Error(this.is + ',nowcontextpost: No detail provided in signal');
			}
		}
		/**
		 *
		 * @param {CustomEvent} evt
		 * @property {any} evt.detail
		 * @property {any} evt.detail.ajax
		 * @property {any} evt.detail.ajax.payload
		 * @property {any} evt.detail.ajax.parameters
		 * @property {string} evt.detail.ajax.contentType
		 * @property {string} evt.detail.ajax.handleAs
		 * @property {string} evt.detail.ajax.url
		 * @property {any} evt.detail.context
		 * @property {HTMLElement} evt.detail.context.element
		 * @property {any} evt.detail.context.model
		 * @listens iron-signal-nowcontextdelete
		 * @returns {Promise}
		 */
		onDeleteRequest(evt: CustomEvent) {
			let detail = evt.detail;
			if (detail) {
				let ajax = this.$.deleteAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				return ajax.generateRequest().completes;
			}else {
				throw new Error(this.is + ',nowcontextdelete: No detail provided in signal');
			}
		}
		/**
		 *
		 * @param {CustomEvent} evt
		 * @property {any} evt.detail
		 * @property {any} evt.detail.ajax
		 * @property {any} evt.detail.ajax.payload
		 * @property {any} evt.detail.ajax.parameters
		 * @property {string} evt.detail.ajax.contentType
		 * @property {string} evt.detail.ajax.handleAs
		 * @property {string} evt.detail.ajax.url
		 * @property {any} evt.detail.context
		 * @property {HTMLElement} evt.detail.context.element
		 * @property {any} evt.detail.context.model
		 * @listens iron-signal-nowcontextpatch
		 * @returns {Promise}
		 */
		onPatchRequest(evt: CustomEvent) {
			let detail = evt.detail;
			if (detail) {
				let ajax = this.$.patchAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				ajax.body = detail.ajax.payload;
				return ajax.generateRequest().completes;
			}else {
				throw new Error(this.is + ',nowcontextpatch: No detail provided in signal');
			}
		}
		/**
		 * Build a Now.AjaxRequest based on the ajax request
		 * @param {any} ironRequest
		 * @param {any} ajax
		 * @returns {Now.AjaxRequest}
		 */
		getAjaxRequest(ironRequest, ajax): Now.AjaxRequest {
			if (ironRequest && ajax) {
				let ajaxReq = new Now.AjaxRequest();
				ajaxReq.response = ironRequest.response;
				ajaxReq.requestUrl = ironRequest.url;
				ajaxReq.status = ironRequest.status;
				ajaxReq.statusText = ironRequest.statusText;
				ajaxReq.responseType = ironRequest.xhr._responseType;
				ajaxReq.withCredentials = ironRequest.xhr.withCredentials;
				ajaxReq.payload = ajax.body;
				ajaxReq.method = ajax.method;
				ajaxReq.params = ajax.params;
				return ajaxReq;
			}
			return null;
		}
		/**
		 * Get a Now.ContextItem based on the ironRequest
		 * @param {any} ironRequest
		 * @param {Now.AjaxRequest} ajaxRequest
		 * @returns {Now.ContextItem}
		 */
		getContextItem(ironRequest, ajaxRequest: Now.AjaxRequest, idKey: string): Now.ContextItem {
			if (ironRequest && ajaxRequest) {
				let contextItem = new Now.ContextItem();
				contextItem.idKey = idKey;
				contextItem.model = ironRequest.response;
				contextItem.lastAjaxRequest = ajaxRequest;
				return contextItem;
			}
			return null;
		}
		/**
		 * Update this elements context property with the new ajax response
		 * @private
		 * @param {any} ironRequest The iron-request element
		 * @param {any} ajax The iron-ajax element
		 * @param {any} detail
		 * @property {string} detail.ajax.idKey - The key that is the ID of the model
		 * @property {any} detail.ajax.payload
		 * @property {any} detail.ajax.parameters
		 * @property {string} detail.ajax.contentType
		 * @property {string} detail.ajax.handleAs
		 * @property {string} detail.ajax.url
		 * @property {any} detail.context
		 * @property {HTMLElement} detail.context.element
		 * @property {any} detail.context.model
		 * @returns {boolean}
		 */
		private updateContext(ironRequest: any, ajax: any, detail: any) {
			try {
				let response = ironRequest.response;
				if (response) {
					let ajaxReq = this.getAjaxRequest(ironRequest, ajax);
					let contextItem = this.getContextItem(ironRequest, ajaxReq, detail.ajax.idKey);
					let contextItemKey = this.getContextKey(ajaxReq, contextItem);
					let isUrl = false;
					if ((contextItemKey && contextItemKey.indexOf) && (contextItemKey.indexOf('http:') > -1 || contextItemKey.indexOf('https:') > -1)) {
						isUrl = true;
					}
					let existingContextItem = this.findContextItem(contextItemKey);
					if (existingContextItem) {
						contextItem = Object.assign(existingContextItem, contextItem);
					}
					if (!isUrl) {
						let path = 'context.' + contextItemKey;
						this.set(path, contextItem);
					} else {
						this.context[contextItemKey] = contextItem;
						this.notifyPath('context.*', this.context[contextItemKey]);
					}
					return true;
				}
				return false;
			} catch (e) {
				return false;
			}
		}
		/**
		 * Determine the context key and return it
		 * @private
		 * @param {Now.AjaxRequest} ajaxReq
		 * @param {Now.ContextItem} contextItem
		 * @returns {string}
		 */
		private getContextKey(ajaxReq: Now.AjaxRequest, contextItem: Now.ContextItem) {
			let contextItemKey = null;
            if (Array.isArray(ajaxReq.response)) {
                contextItemKey = ajaxReq.requestUrl;
            } else {
                contextItemKey = contextItem.id;
            }
            return contextItemKey;
        }
		/**
		 * Find a context item by it's contextItemKey
		 * @private
		 * @param {any} contextItemKey
		 * @returns {Now.ContextItem}
		 */
		findContextItem(contextItemKey): Now.ContextItem {
			let context = this.context;
			if (context.hasOwnProperty(contextItemKey)) {
				return context[contextItemKey];
			}
			return null;
		}
		/**
		 * This is a basic request/response event handler
		 * @param {CustomEvent} evt
		 */
		private _onRequestResponse(evt: CustomEvent) {
			let detail = evt.detail;

		}

		private _dispatchEvent(options): Event {
			let event: Event = null;
			options = options || {};
			if (options.type && options.target) {
				let node = options.target || window;
				let bubbles = options.bubbles === undefined ? true : options.bubbles;
				let cancelable = Boolean(options.cancelable);
				event = new Event(options.type, {bubbles: bubbles, cancelable: cancelable})
				event['detail'] = options.detail;
				node.dispatchEvent(event);
			} else {
				throw new Error('Event options must include an event "type" and event "target"');
			}
			return event;
		}
	}
}

NowElements.NowContext.register();
