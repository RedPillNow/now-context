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

	export class PubSubListener {
		private _eventName: string;
		private _handler: any;
		private _context: any;

		constructor(eventName, handler, context?) {
			this.eventName = eventName;
			this.handler = handler;
			this.context = context;
		}

		get eventName() {
			return this._eventName;
		}

		set eventName(eventName) {
			if (eventName) {
				this._eventName = eventName;
			} else {
				throw new Error('The eventName cannot be null, undefined or empty string');
			}
		}

		get handler() {
			return this._handler;
		}

		set handler(handler: any) {
			if (handler) {
				if (typeof handler === 'function') {
					this._handler = handler;
				} else {
					throw new Error('The handler must be a function, you passed in a ' + typeof handler);
				}
			} else {
				throw new Error('The handler cannot be null, undefined or empty string');
			}
		}

		get context() {
			return this._context;
		}

		set context(context) {
			this._context = context;
		}
	}

	export class PubSub {
		private _events: any;
		private _triggeredEvts: any[];

		constructor() {
			this._events = {};
		}

		get events() {
			return this._events;
		}

		set events(events) {
			this._events = events || {};
		}

		get triggeredEvts() {
			return this._triggeredEvts || [];
		}

		set triggeredEvts(triggeredEvts) {
			this._triggeredEvts = triggeredEvts || [];
		}

		on(eventName, fn, context) {
			if (!this.listenerExists(eventName, context)) {
				let listener = new PubSubListener(eventName, fn, context);
				this.events[eventName] = this.events[eventName] || [];
				this.events[eventName].push(listener);
			}
		}

		off(eventName, fn) {
			if (this.events[eventName]) {
				for (let i = 0; i < this.events[eventName].length; i++) {
					if (this.events[eventName][i].handler === fn) {
						this.events[eventName].splice(i, 1);
						break;
					}
				}
			}
		}

		trigger(eventName, data) {
			let count = 0;
			if (this.events[eventName]) {
				this.events[eventName].forEach((listener: PubSubListener) => {
					if (listener.context && listener.handler && listener.handler.call) {
						count++;
						listener.handler.call(listener.context, data);
					} else {
						if (listener.handler && typeof listener.handler === 'function') {
							count++;
							listener.handler(data);
						} else {
							throw new Error('It appears that the ' + eventName + ' handler is not a function!');
						}
					}
				});
			}
			let dispatchedEvts = this.triggeredEvts;
			let evtObj = {
				time: new Date(),
				eventName: eventName,
				listenerCount: count
			}
			dispatchedEvts.push(evtObj);
			this.triggeredEvts = dispatchedEvts;
		}

		listenerExists(eventName, context) {
			if (eventName && context) {
				let event = this.events[eventName];
				if (event) {
					let found = event.filter((item, idx, arr) => {
						return item.context === context;
					});
					return found && found.length > 0;
				}
			}
			return false;
		}
	}
}

namespace NowElements {

	/**
	 * Manage the context of an application. All XHR requests should pass through this element
	 *
	 * @author Keith Strickland <keith@redpillnow.com>
	 */
	export class NowContext extends NowElements.BaseElement {
		static get is() { return 'now-context' }

		static get properties() {
			return {
				context: {
					type: Object,
					value: {},
					notify: true
				},
				pubsub: Object
			}
		}

		constructor() {
			super();
			(<any>this).pubsub = new Now.PubSub();
			(<any>this).getListener = this._onGetRequest.bind(this);
			(<any>this).putListener = this._onPutRequest.bind(this);
			(<any>this).postListener = this._onPostRequest.bind(this);
			(<any>this).deleteListener = this._onDeleteRequest.bind(this);
			(<any>this).patchListener = this._onPatchRequest.bind(this);
		}

		connectedCallback() {
			// Create a global for interacting with this element
			super.connectedCallback();
			window['NowContext'] = this;
			window.addEventListener('nowcontextget', (<any>this).getListener);
			window.addEventListener('nowcontextput', (<any>this).putListener);
			window.addEventListener('nowcontextpost', (<any>this).postListener);
			window.addEventListener('nowcontextdelete', (<any>this).deleteListener);
			window.addEventListener('nowcontextpatch', (<any>this).patchListener);
		}

		disconnectedCallback() {
			super.disconnectedCallback();
			window.removeEventListener('nowcontextget', (<any>this).getListener);
			window.removeEventListener('nowcontextput', (<any>this).putListener);
			window.removeEventListener('nowcontextpost', (<any>this).postListener);
			window.removeEventListener('nowcontextdelete', (<any>this).deleteListener);
			window.removeEventListener('nowcontextpatch', (<any>this).patchListener);
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
		 * @listens window.nowcontextget
		 * @event nowContextGetReqDone
		 * @returns {Promise}
		 */
		private _onGetRequest(evt: CustomEvent) {
			// console.log(NowContext.is, 'onGetRequest', arguments);
			let detail = evt.detail;
			if (detail) {
				let ajax: any = this.$.getAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				return ajax.generateRequest().completes
					.then((ironRequest) => {
						this.triggerEvt('nowContextGetReqDone', ironRequest.response);
                        return this._updateContext(ironRequest, ajax, detail);
					})
					.catch((err) => {
						throw new Error(NowContext.is + '.onGetRequest failed');
					});
			}else {
				throw new Error(NowContext.is + ':iron-signal-nowcontextget: No detail provided in signal');
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
		 * @listens window.nowcontextput
		 * @event nowContextPutReqDone
		 * @returns {Promise}
		 */
		private _onPutRequest(evt: CustomEvent) {
			let detail = evt.detail;
			if (detail) {
				let ajax: any = this.$.putAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				ajax.body = detail.ajax.payload;
				return ajax.generateRequest().completes
					.then((ironRequest) => {
						this.triggerEvt('nowContextPutReqDone', ironRequest.response);
						return this._updateContext(ironRequest, ajax, detail);
					})
					.catch((err) => {
						throw new Error(NowContext.is + '.onPutRequest failed');
					});
			}else {
				throw new Error(NowContext.is + ',nowcontextput: No detail provided in signal');
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
		 * @listens window.nowcontextpost
		 * @event nowContextPostReqDone
		 * @returns {Promise}
		 */
		private _onPostRequest(evt: CustomEvent) {
			let detail = evt.detail;
			if (detail) {
				let ajax: any = this.$.postAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				ajax.body = detail.ajax.payload;
				return ajax.generateRequest().completes
					.then((ironRequest) => {
						this.triggerEvt('nowContextPostReqDone', ironRequest.response);
						return this._updateContext(ironRequest, ajax, detail);
					})
					.catch((err) => {
						throw new Error(NowContext.is + '.onPutRequest failed');
					});
			}else {
				throw new Error(NowContext.is + ',nowcontextpost: No detail provided in signal');
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
		 * @listens window.nowcontextdelete
		 * @returns {Promise}
		 */
		private _onDeleteRequest(evt: CustomEvent) {
			let detail = evt.detail;
			if (detail) {
				let ajax: any = this.$.deleteAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				return ajax.generateRequest().completes;
			}else {
				throw new Error(NowContext.is + ',nowcontextdelete: No detail provided in signal');
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
		 * @listens window.nowcontextpatch
		 * @event nowContextPatchReqDone
		 * @returns {Promise}
		 */
		private _onPatchRequest(evt: CustomEvent) {
			let detail = evt.detail;
			if (detail) {
				let ajax: any = this.$.patchAjax;
				ajax.params = detail.ajax.parameters;
				ajax.handleAs = detail.ajax.handleAs || 'json';
				ajax.url = detail.ajax.url
				ajax.contentType = detail.ajax.contentType || 'application/json';
				ajax.body = detail.ajax.payload;
				return ajax.generateRequest().completes
					.then((ironRequest) => {
						this.triggerEvt('nowContextPatchReqDone', ironRequest.response);
						return this._updateContext(ironRequest, ajax, detail);
					})
					.catch((err) => {
						throw new Error(NowContext.is + '.onPutRequest failed');
					});
			}else {
				throw new Error(NowContext.is + ',nowcontextpatch: No detail provided in signal');
			}
		}
		/**
		 * Build a Now.AjaxRequest based on the ajax request
		 * @param {any} ironRequest
		 * @param {any} ajax
		 * @returns {Now.AjaxRequest}
		 */
		private _getAjaxRequest(ironRequest, ajax): Now.AjaxRequest {
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
		private _createContextItem(ironRequest, ajaxRequest: Now.AjaxRequest, idKey: string): Now.ContextItem {
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
		 * @event nowContextItemUpdated
		 * @event nowContextItemAdded
		 * @returns {boolean}
		 */
		private _updateContext(ironRequest: any, ajax: any, detail: any) {
			try {
				let response = ironRequest.response;
				if (response) {
					let ajaxReq = this._getAjaxRequest(ironRequest, ajax);
					let contextItem = this._createContextItem(ironRequest, ajaxReq, detail.ajax.idKey);
					let contextItemKey = this._getContextKey(ajaxReq, contextItem);
					let isUrl = false;
					if ((contextItemKey && contextItemKey.indexOf) && (contextItemKey.indexOf('http:') > -1 || contextItemKey.indexOf('https:') > -1)) {
						isUrl = true;
					}
					let existingContextItem = this.findContextItem(contextItemKey);
					let itemMerged = false;
					if (existingContextItem) {
						itemMerged = true;
						contextItem = Object.assign(existingContextItem, contextItem);
					}
					let evtName = itemMerged ? 'nowContextItemUpdated' : 'nowContextItemAdded';
					if (!isUrl) {
						let path = 'context.' + contextItemKey;
						this.set(path, contextItem);
					} else {
						(<any> this).context[contextItemKey] = contextItem;
						this.notifyPath('context.*', (<any> this).context[contextItemKey]);
					}
					this.triggerEvt(evtName, contextItem);
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
		private _getContextKey(ajaxReq: Now.AjaxRequest, contextItem: Now.ContextItem) {
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
			let context = this.get('context');
			if (context.hasOwnProperty(contextItemKey)) {
				return context[contextItemKey];
			}
			return null;
		}
		/**
		 * Trigger a pubsub event. This does not create a true Event or CustomEvent item
		 * @param {string} eventName
		 * @param {any} data
		 */
		triggerEvt(eventName, data) {
			let pubsub: Now.PubSub = this.get('pubsub');
			pubsub.trigger(eventName, data);
		}
		/**
		 * Subscribe to pubsub events
		 *
		 * @param {any} eventName The name of the event to listen for
		 * @param {function} fn The callback function
		 * @param {any} context The context in which to run the callback
		 */
		listenEvt(eventName, fn, context) {
			let pubsub: Now.PubSub = this.get('pubsub');
			pubsub.on(eventName, fn, context);
		}
	}
}

customElements.define(NowElements.NowContext.is, NowElements.NowContext);
