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
		protected _handler: any;
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
		private _id: number;
		protected _handler: any;

		constructor(eventName, handler, context?) {
			super(eventName, handler, context);
		}

		get id() {
			return this._id;
		}

		set id(id) {
			this._id = id;
		}

		set handler(handler) {
			this._handler = handler;
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
	/**
	 * Derived from: https://gist.github.com/learncodeacademy/777349747d8382bfb722 with modification
	 * @export
	 * @class PubSub
	 */
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
	export class NowContext extends Polymer.Element {
		static get is() { return 'now-context' }
		static get properties() {
			return {
				context: {
					type: Object,
					value: {},
					notify: true
				},
			}
		}
		/**
		 * The PubSub system
		 * @private
		 * @type {Now.PubSub}
		 */
		private pubsub: Now.PubSub;
		/**
		 * The web worker
		 * @private
		 * @type {Worker}
		 */
		private worker: Worker;
		/**
		 * This is to keep track of a Promise's resolve/reject methods
		 * @type {number}
		 */
		private globalId: number = 0;
		/**
		 * Listeners for the Request/Response system
		 * @private
		 * @type {any}
		 */
		private reqResListeners = {};

		constructor() {
			super();
			this.pubsub = new Now.PubSub();
		}
		/**
		 * Subscribe to relevant PubSub events
		 */
		connectedCallback() {
			// Create a global for interacting with this element
			super.connectedCallback();
			window.NowContext = this;
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
			if (window.Worker) {
				this.worker.removeEventListener('message', (<any>this).onWorkerMsg);
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
					let contextItem = this._createContextItem(ajaxReq, detail.idKey);
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
			this.pubsub.trigger(eventName, data);
		}
		/**
		 * Subscribe to pubsub events
		 *
		 * @param {any} eventName The name of the event to listen for
		 * @param {function} fn The callback function
		 * @param {any} context The context in which to run the callback
		 */
		listenEvt(eventName, fn, context) {
			this.pubsub.on(eventName, fn, context);
		}
		/**
		 * Un-Subscribe from an event
		 * @param {any} eventName
		 * @param {function} fn The callback for the event
		 */
		unListenEvt(eventName, fn) {
			this.pubsub.off(eventName, fn);
		}
		/**
		 * A request response function. This is mainly used for doing an ajax
		 * call. Will return a promise which can then be used to do something
		 * once the request is finished
		 * @param {any} payload
		 * @property {any} payload.ajax Should contain an object with all the appropriate values to do the AJAX request
		 * @property {string} payload.ajax.method
		 * @property {string} payload.ajax.url
		 * @property {any} payload.ajax.payload If doing something other than a GET this is the payload to send to the server
		 * @property {any} payload.ajax.params The url parameters
		 * @property {string} payload.ajax.responseType
		 * @returns {Promise}
		 */
		reqres(payload) {
			return this._sendWorkerMsg(payload);
		}
		/**
		 * This creates a promise and listener to pass along to the worker. It sends the payload
		 * to the worker which then does the request.
		 * @private
		 * @param {any} payload
		 * @property {string} idKey The key for the ID
		 * @property {any} payload.ajax Should contain an object with all the appropriate values to do the AJAX request
		 * @property {string} payload.ajax.method
		 * @property {string} payload.ajax.url
		 * @property {any} payload.ajax.payload If doing something other than a GET this is the payload to send to the server
		 * @property {any} payload.ajax.params The url parameters
		 * @property {string} payload.ajax.responseType
		 * @returns {Promise}
		 */
		private _sendWorkerMsg(payload) {
			const msgId = this.globalId++;
			let listener: Now.ReqResListener = new Now.ReqResListener('reqRes' + msgId, null);
			listener.id = msgId;
			return new Promise((resolve, reject) => {
				listener.resolve = resolve;
				listener.reject = reject;
				this.reqResListeners[msgId] = listener;
				const msg = {
					id: msgId,
					idKey: payload.idKey,
					ajax: payload.ajax
				};
				this.worker.postMessage(msg);
			});
		}
		/**
		 * Responds to the web worker postMessage event. If processing is successful resolve
		 * the Promise from _sendWorkerMsg
		 * @private
		 * @param {MessageEvent} evt
		 * @property {any} evt.data
		 * @property {Now.AjaxRequest} evt.data.ajaxReq
		 * @property {number} evt.data.id
		 */
		private _onWorkerMsg(evt: MessageEvent) {
			let data = evt.data;
			try {
				let ajaxReq: Now.AjaxRequest = new Now.AjaxRequest(data.ajaxReq);
				this._updateContext(ajaxReq, {idKey: data.idKey});
				this.reqResListeners[data.id].resolve(ajaxReq);
				delete this.reqResListeners[data.id];
			} catch (err) {
				this.reqResListeners[data.id].reject(err);
			}
		}
	}
}

customElements.define(NowElements.NowContext.is, NowElements.NowContext);
