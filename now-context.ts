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

		constructor(obj?: any) {
			Object.assign(this, obj);
		}

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

	export class ReqResListener extends PubSubListener {
		private _resolve: any;
		private _reject: any;

		constructor(eventName, handler, context?) {
			super(eventName, handler, context);
		}

		get resolve() {
			return this._resolve;
		}

		set resolve(resolve) {
			this._resolve = resolve;
		}

		get reject() {
			return this._reject;
		}

		set reject(reject) {
			this._reject = reject;
		}
	}

	export class PubSubEvent {
		private _eventName: string;
		private _listeners: PubSubListener[];

		constructor(eventName?) {
			this.eventName = eventName;
		}

		get eventName() {
			return this._eventName;
		}

		set eventName(eventName) {
			this._eventName = eventName;
		}

		get listeners() {
			return this._listeners || [];
		}

		set listeners(listeners) {
			this._listeners = listeners || [];
		}
	}

	export class PubSub {
		private _events: any;
		private _history: any[];

		constructor() {
			this._events = {};
		}

		get events() {
			return this._events;
		}

		set events(events) {
			this._events = events || {};
		}

		get history() {
			return this._history || [];
		}

		set history(history) {
			this._history = history || [];
		}
		/**
		 * Subscribe a listener to an event
		 * @param {any} eventName
		 * @param {function} fn The callback to run
		 * @param {any} context The context in which to run the callback
		 */
		on(eventName, fn, context): void {
			if (!this._listenerExists(eventName, fn, context)) {
				let listener = new PubSubListener(eventName, fn, context);
				this.events[eventName] = this.events[eventName] || new Now.PubSubEvent(eventName);
				let listeners = this.events[eventName].listeners;
				listeners.push(listener);
				this.events[eventName].listeners = listeners;
			} else {
				console.warn('Listener for ' + eventName + ' with callback ', fn, ' already exists!');
			}
		}
		/**
		 * Unsubscribe a listener from an event
		 *
		 * @param {any} eventName
		 * @param {function} fn
		 */
		off(eventName, fn): void {
			if (this.events[eventName]) {
				for (let i = 0; i < this.events[eventName].listeners.length; i++) {
					let listener: PubSubListener = this.events[eventName].listeners[i];
					if (listener.handler === fn) {
						this.events[eventName].listeners.splice(i, 1);
						break;
					}
				}
			}
		}
		/**
		 * Trigger an event
		 * @param {any} eventName
		 * @param {any} data
		 */
		trigger(eventName, data): void {
			let listeners = [];
			if (this.events[eventName]) {
				this.events[eventName].listeners.forEach((listener: PubSubListener) => {
					if (listener.context && listener.handler && listener.handler.call) {
						listeners.push(listener);
						listener.handler.call(listener.context, data);
					} else {
						if (listener.handler && typeof listener.handler === 'function') {
							listeners.push(listener);
							listener.handler(data);
						} else {
							throw new Error('It appears that the ' + eventName + ' handler is not a function!');
						}
					}
				});
			}
			this._updateHistory(eventName, listeners);
		}
		/**
		 * Determine if a listener already exists for a particular event. We can only
		 * really identify if a listener exists if a context is provided
		 * @param {string} eventName
		 * @param {any} fn The callback function
		 * @param {any} context The context of the listener
		 * @returns {boolean}
		 */
		private _listenerExists(eventName: string, fn: any, context: any): boolean {
			if (eventName && context) {
				let event: Now.PubSubEvent = this.events[eventName];
				if (event) {
					let found = event.listeners.filter((item: PubSubListener, idx, arr) => {
						return item.context === context && item.handler === fn && item.eventName === eventName;
					});
					return found && found.length > 0;
				}
			}
			return false;
		}
		/**
		 * Update the history object
		 * @private
		 * @param {any} eventName
		 * @param {any} listeners listeners that were serviced
		 */
		private _updateHistory(eventName, listeners): void {
			let dispatchedEvts = this.history;
			let evtObj = {
				time: new Date(),
				eventName: eventName,
				listeners: listeners
			}
			dispatchedEvts.push(evtObj);
			this.history = dispatchedEvts;
		}
	}
}

namespace NowElements {
	declare var window;
	/**
	 * Manage the context of an application. All XHR requests should pass through this element and it
	 * will keep track of all requests and store them in the context object. This element also provides
	 * a very simple PubSub system.
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
		/**
		 * This is to keep track of a Promise's resolve/reject methods
		 * @type {number}
		 */
		private globalId: number = 0;
		/**
		 * The web worker
		 * @private
		 * @type {Worker}
		 */
		private worker: Worker;

		constructor() {
			super();
			(<any>this).pubsub = new Now.PubSub();
		}
		/**
		 * Subscribe to relevant PubSub events
		 */
		connectedCallback() {
			// Create a global for interacting with this element
			super.connectedCallback();
			window.NowContext = this;
			this.listenEvt('nowcontextget', this._onGetRequest, this);
			if (window.Worker) {
				this.worker = new Worker(this.resolveUrl('now-context-worker.js'));
				(<any>this).onWorkerMsg = this._onWorkerMsg.bind(this);
				this.worker.addEventListener('message', (<any>this).onWorkerMsg);
			}
		}
		/**
		 * UnSubscribe to relevant PubSub events and worker message event
		 *
		 */
		disconnectedCallback() {
			super.disconnectedCallback();
			this.worker.removeEventListener('message', (<any>this).onWorkerMsg);
			this.unListenEvt('nowcontextget', this._onGetRequest);
		}
		/**
		 * Perform a GET request and return the promise
		 * @param {CustomEvent} detail
		 * @property {any} detail.ajax
		 * @property {any} detail.ajax.payload
		 * @property {any} detail.ajax.parameters
		 * @property {string} detail.ajax.contentType
		 * @property {string} detail.ajax.handleAs
		 * @property {string} detail.ajax.url
		 * @property {any} detail.context
		 * @property {HTMLElement} detail.context.element
		 * @property {any} detail.context.model
		 * @listens pubsub#nowcontextget
		 * @event nowContextGetReqDone
		 * @returns {Promise}
		 */
		private _onGetRequest(detail: any) {
			// console.log(NowContext.is, 'onGetRequest', arguments);
			if (detail) {
				this.worker.postMessage({ type: detail.ajax.method, detail: detail, id: this.globalId++ });
			}else {
				throw new Error(NowContext.is + ':iron-signal-nowcontextget: No detail provided in signal');
			}
		}
		/**
		 * Get a Now.ContextItem based on the ironRequest
		 * @param {any} ironRequest
		 * @param {Now.AjaxRequest} ajaxRequest
		 * @returns {Now.ContextItem}
		 */
		private _createContextItem(ajaxRequest: Now.AjaxRequest, idKey: string): Now.ContextItem {
			if (ajaxRequest) {
				let contextItem = new Now.ContextItem();
				contextItem.idKey = idKey;
				contextItem.model = ajaxRequest.response;
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
		private _updateContext(ajaxReq: Now.AjaxRequest, detail: any) {
			try {
				let response = ajaxReq.response;
				if (response) {
					let contextItem = this._createContextItem(ajaxReq, detail.ajax.idKey);
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
		/**
		 * Un-Subscribe from an event
		 * @param {any} eventName
		 * @param {function} fn The callback for the event
		 */
		unListenEvt(eventName, fn) {
			let pubsub: Now.PubSub = this.get('pubsub');
			pubsub.off(eventName, fn);
		}
		/**
		 * Responds to the web worker postMessage event
		 *
		 * @private
		 * @param {MessageEvent} evt
		 */
		private _onWorkerMsg(evt: MessageEvent) {
			let ajaxReq: Now.AjaxRequest = new Now.AjaxRequest(evt.data.ajax);
			let detail = evt.data.detail;
			switch (ajaxReq.method.toLowerCase()) {
				case 'get':
					this.triggerEvt('nowContextGetReqDone', ajaxReq.response);
					this._updateContext(ajaxReq, detail);
					break;
				case 'put':
					this.triggerEvt('nowContextPutReqDone', ajaxReq.response);
					this._updateContext(ajaxReq, detail);
					break;
				case 'post':
					this.triggerEvt('nowContextPostReqDone', ajaxReq.response);
					this._updateContext(ajaxReq, detail);
					break;
				case 'patch':
					this.triggerEvt('nowContextPostReqDone', ajaxReq.response);
					this._updateContext(ajaxReq, detail);
					break;
				case 'delete':
					this.triggerEvt('nowContextDeleteReqDone', ajaxReq.response);
					// this._updateContext(ajaxReq, detail);	// TODO
					break;
			}
		}
	}
}

customElements.define(NowElements.NowContext.is, NowElements.NowContext);
