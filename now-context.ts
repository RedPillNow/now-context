import {customElement, property} from '@polymer/decorators';
import { PolymerElement, html } from '@polymer/polymer';

namespace Now {

	export class AjaxRequest {
		private _authorization: string;
		private _method: string;
		private _params: any;
		private _payload: any;
		private _response: any;
		private _responseType: string;
		private _requestUrl: string;
		private _status: number;
		private _statusText: string;
		private _userAuthorizationString: string;
		private _withCredentials: boolean;

		constructor(obj?: any) {
			Object.assign(this, obj);
		}

		get authorization() {
			return this._authorization;
		}

		set authorization(authorization) {
			this._authorization = authorization;
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

		get userAuthorizationString() {
			return this._userAuthorizationString;
		}

		set userAuthorizationString(userAuthorizationString) {
			this._userAuthorizationString = userAuthorizationString;
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
		private _eventName: string | Symbol;
		protected _handler: any;
		private _context: any;

		constructor(eventName, handler, context?) {
			this.eventName = eventName;
			this.handler = handler;
			this.context = context;
		}

		get eventName(): string | Symbol {
			return this._eventName;
		}

		set eventName(eventName: string | Symbol) {
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
		// protected _handler: any;

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
		private _eventName: string | Symbol;
		private _listeners: PubSubListener[];

		constructor(eventName?) {
			this.eventName = eventName;
		}

		get eventName(): string | Symbol {
			return this._eventName;
		}

		set eventName(eventName: string | Symbol) {
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
		on(eventName: any, fn, context): void {
			if (!this._listenerExists(eventName, fn, context)) {
				this.createListener(eventName, fn, context, false);
			} else {
				console.warn('Listener for ' + eventName + ' with callback ', fn, ' already exists!');
			}
		}
		/**
		 * Add a listener to an event
		 * @private
		 * @param {*} eventName
		 * @param {*} fn
		 * @param {*} context
		 * @param {boolean} [isReqRes]
		 */
		private createListener(eventName: any, fn: any, context?: any, isReqRes?: boolean) {
			let listener = null;
			if (isReqRes) {
				listener = new ReqResListener(eventName, fn, context);
			} else {
				listener = new PubSubListener(eventName, fn, context);
			}
			this.events[eventName] = this.events[eventName] || new Now.PubSubEvent(eventName);
			let listeners = this.events[eventName].listeners;
			listeners.push(listener);
			this.events[eventName].listeners = listeners;
		}
		/**
		 * Unsubscribe a listener from an event
		 *
		 * @param {any} eventName
		 * @param {function} fn
		 */
		off(eventName: any, fn): void {
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
		 * @param {any} data will be passed to the listeners of the event
		 */
		trigger(eventName: any, data): void {
			let executedListeners = [];
			let returnVal = null;
			if (this.events[eventName]) {
				let listeners = this.events[eventName].listeners;
				listeners.forEach((listener: PubSubListener) => {
					if (listener.context && listener.handler && listener.handler.call) {
						executedListeners.push(listener);
						returnVal = listener.handler.call(listener.context, data);
					} else {
						if (listener.handler && typeof listener.handler === 'function') {
							executedListeners.push(listener);
							returnVal = listener.handler(data);
						} else {
							throw new Error('It appears that the ' + eventName + ' handler is not a function!');
						}
					}
				});
			}
			this._updateHistory(eventName, executedListeners, data);
			return returnVal;
		}
		/**
		 * Determine if a listener already exists for a particular event. We can only
		 * really identify if a listener exists if a context is provided
		 * @param {string} eventName
		 * @param {any} fn The callback function
		 * @param {any} context The context of the listener
		 * @returns {boolean}
		 */
		private _listenerExists(eventName: any, fn: any, context: any): boolean {
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
		 * @param {PubSubListener[]} listeners listeners that were serviced
		 * @param {any} data The data object from the trigger
		 */
		private _updateHistory(eventName: any, listeners: PubSubListener[], data: any): void {
			let dispatchedEvts = this.history;
			let evtObj = {
				time: new Date(),
				eventName: eventName,
				listeners: listeners,
				payload: data
			}
			dispatchedEvts.push(evtObj);
			this.history = dispatchedEvts;
		}
	}
}

namespace NowElements {
	/**
	 * Type representing the properties to set on a Now.AjaxRequest provided by
	 * now-context
	 */
	export type ReqResFetchAjaxConfig = {
		/**
		 * The XHR Method type
		 * @type {string}
		 */
		method: string;
		/**
		 * The parameters to pass along in the URL
		 * @type {any}
		 */
		params?: any;
		/**
		 * The payload for a PUT,POST,DELETE or PATCH
		 * @type {any}
		 */
		payload?: any;
		/**
		 * The URL for the request
		 * @type {string}
		 */
		url: string;
		/**
		 * The response type
		 * @type {string}
		 */
		responseType?: string;
		/**
		 * True if authentication header is present
		 * @type {boolean}
		 */
		withCredentials?: boolean;
		/**
		 * The `username:password` string to send to the server
		 * for authorization
		 * @type {string}
		 */
		userAuthorizationString?: string;
	};
	/**
	 * Type representing the properties to set when making a fetch from now-context
	 * @example
	 * let config: ReqResFetchConfig = {
	 * 	id: 1,
	 * 	idKey: 'id',
	 * 	ajax: {
	 * 		method: 'GET',
	 * 		url: 'http://somehost.com/api/1'
	 * 	}
	 * }
	 * NowContext.fetch(config).then((ajaxRequest) => {//...});
	 */
	export type ReqResFetchConfig = {
		/**
		 * The ID of the item
		 * @type {(string | number)}
		 */
		id?: string | number;
		/**
		 * The property name in the fetched object that is the identifier
		 * @type {string}
		 */
		idKey: string;
		/**
		 * The ajax configuration
		 * @type {NowElements.ReqResFetchAjaxConfig}
		 */
		ajax: ReqResFetchAjaxConfig;
	};

	declare var window;
	/**
	 * Manage the context of an application. All XHR requests should pass through this element and it
	 * will keep track of all requests and store them in the context object. This element also provides
	 * a very simple PubSub and Request/Response system.
	 *
	 * @author Keith Strickland <keith@redpillnow.com>
	 */
	@customElement('now-context')
	export class NowContext extends PolymerElement {
		static is: string = 'now-context';
		static get template() {
			return html `
				<style>
					:host {
						display: none;
					}
				</style>
			`;
		}
		static get importMeta() {
			return import.meta;
		}
		/**
		 * This is the stored context to allow data-binding
		 * @type {any}
		 * @readonly
		 */
		@property({
			type: Object,
			notify: true,
			readOnly: true
		})
		context: any;

		/**
		 * This is mainly for identification and troubleshooting
		 */
		get is() {
			return NowContext.is;
		}
		/**
		 * This is the stored context
		 * @type {any}
		 * @readonly
		 */
		get store() {
			return this._store;
		}
		UPDATED_EVENT = Symbol('nowContextItemUpdated');
		ADDED_EVENT = Symbol('nowContextItemAdded');
		DELETED_EVENT = Symbol('nowContextItemDeleted');
		/**
		 * The context store. All requests are stored here
		 * @type {any}
		 * @private
		 */
		private _store: any = {};
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

		private onWorkerMsg = null;
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
				this.worker = new Worker(this.resolveUrl('./now-context-worker.js'));
				this.onWorkerMsg = this._onWorkerMsg.bind(this);
				this.worker.addEventListener('message', (<any>this).onWorkerMsg);
			} else {
				console.warn('now-context requires a browser that supports Web Workers! You may experience erratic and undependable behavior of this element.');
			}
			const loadedEvt = new CustomEvent('now-context-loaded', { detail: this });
			document.dispatchEvent(loadedEvt);
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
		private _updateContext(ajaxReq: Now.AjaxRequest, detail: any): boolean {
			try {
				let response = ajaxReq.response;
				if (response) {
					let contextItem = this._createContextItem(ajaxReq, detail.idKey);
					let contextItemKey = this._getContextKey(ajaxReq, contextItem);
					let existingContextItem = this.findContextItem(contextItemKey);
					let evtName = this.ADDED_EVENT;
					if (existingContextItem) {
						contextItem = Object.assign(existingContextItem, contextItem);
						evtName = this.UPDATED_EVENT;
					}
					this.addStoreItem(contextItem, contextItemKey);
					this.trigger(evtName, contextItem);
					return true;
				}
			} catch (e) {
				return false;
			}
			return false;
		}
		/**
		 * Determine the context key and return it
		 * @private
		 * @param {Now.AjaxRequest} ajaxReq
		 * @param {Now.ContextItem} contextItem
		 * @returns {string}
		 */
		private _getContextKey(ajaxReq: Now.AjaxRequest, contextItem: Now.ContextItem): string {
			let contextItemKey = null;
			if (Array.isArray(ajaxReq.response) || (!contextItem.id && contextItem.idKey === 'url')) {
				contextItemKey = ajaxReq.requestUrl;
			} else {
				contextItemKey = contextItem.id;
			}
			return contextItemKey;
		}
		/**
		 * Add an item to the store. This should be the only way possible of adding to the store
		 * @param {any} item
		 * @param {any} idKey
		 * @returns {Now.ContextItem} Item added/updated
		 */
		addStoreItem(item: any, idKey: string): Now.ContextItem {
			let contextItem = null;
			let contextItemKey = null;
			if (item instanceof Now.ContextItem) {
				contextItem = item;
			} else {
				contextItem = new Now.ContextItem();
				contextItem.idKey = idKey;
				contextItem.model = item;
			}
			let protocolRegEx = /(http:|https:){1}/;
			if (contextItem.idKey === 'url' || protocolRegEx.test(contextItem.idKey)) {
				if (contextItem.idKey === 'url' && contextItem.lastAjaxRequest) {
					contextItemKey = (<Now.AjaxRequest>contextItem.lastAjaxRequest).requestUrl;
				} else {
					contextItemKey = contextItem.idKey;
					if (!contextItemKey) {
						contextItemKey = new Date().getTime();
					}
				}
			} else {
				contextItemKey = contextItem.id;
			}
			this._store[contextItemKey] = contextItem;
			// The _setContext method is part of Polymer: bower_components/Polymer/lib/mixins/property-effects.html
			(<any>this)._setContext(this.store);
			return contextItem;
		}
		/**
		 * Remove an item from the store
		 * @param {any} itemId
		 * @returns {Now.ContextItem} Item removed from the store
		 */
		removeStoreItem(itemId): Now.ContextItem {
			let contextItem = this.findContextItem(itemId);
			if (contextItem) {
				delete this._store[contextItem.id];
				// The _setContext method is part of Polymer: bower_components/Polymer/lib/mixins/property-effects.html
				(<any>this)._setContext(this.store);
				this.trigger(this.DELETED_EVENT, contextItem);
			} else {
				console.info('now-context: Store item with ID ' + itemId + ' not found. Nothing removed');
			}
			return contextItem;
		}
		/**
		 * Find a context item by it's contextItemKey
		 * @private
		 * @param {any} contextItemKey
		 * @returns {Now.ContextItem}
		 */
		findContextItem(contextItemKey): Now.ContextItem {
			let context = this.store;
			if (context.hasOwnProperty(contextItemKey)) {
				return context[contextItemKey];
			}
			return null;
		}
		/**
		 * Trigger a pubsub event. This does not create a true Event or CustomEvent item
		 * @param {string | Symbol} eventName
		 * @param {any} data
		 * @returns {any | Promise}
		 */
		trigger(eventName: any, data: any): any {
			return this.pubsub.trigger(eventName, data);
		}
		/**
		 * Subscribe to pubsub and reqres events
		 *
		 * @param {string | Symbol} eventName The name of the event to listen for
		 * @param {function} fn The callback function
		 * @param {any} context The context in which to run the callback
		 */
		on(eventName: any, fn: any, context: any) {
			this.pubsub.on(eventName, fn, context);
		}
		/**
		 * Un-Subscribe from an event
		 * @param {string | Symbol} eventName
		 * @param {function} fn The callback for the event
		 */
		off(eventName: any, fn) {
			this.pubsub.off(eventName, fn);
		}
		/**
		 * A request response function. This is mainly used for doing an ajax
		 * call. Will return a promise which can then be used to do something
		 * once the request is finished
		 * @param {NowElements.ReqResFetchConfig} payload
		 * @property {NowElements.ReqResFetchAjaxConfig} payload.ajax Should contain an object with all the appropriate values to do the AJAX request
		 * @property {string} payload.ajax.method
		 * @property {string} payload.ajax.url
		 * @property {any} payload.ajax.payload If doing something other than a GET this is the payload to send to the server
		 * @property {any} payload.ajax.params The url parameters
		 * @property {string} payload.ajax.responseType
		 * @property {string} payload.idKey The key in the model which is the ID
		 * @returns {Promise}
		 */
		fetch(payload): any {
			return this._sendWorkerMsg(payload);
		}
		/**
		 * This creates a promise and listener to pass along to the worker. It sends the payload
		 * to the worker which then does the request.
		 * @private
		 * @param {NowElements.ReqResFetchConfig} payload
		 * @property {string} idKey The key for the ID
		 * @property {any} payload.ajax Should contain an object with all the appropriate values to do the AJAX request
		 * @property {string} payload.ajax.method
		 * @property {string} payload.ajax.url
		 * @property {any} payload.ajax.payload If doing something other than a GET this is the payload to send to the server
		 * @property {any} payload.ajax.params The url parameters
		 * @property {string} payload.ajax.responseType
		 * @returns {Promise}
		 */
		private _sendWorkerMsg(payload): any {
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
				this._updateContext(ajaxReq, { idKey: data.idKey });
				let listener = this.reqResListeners[data.id];
				if (listener) {
					listener.resolve(ajaxReq);
				} else {
					throw new Error('Unable to complete request, unable to find Listener with ID ' + data.id);
				}
			} catch (err) {
				let listener = this.reqResListeners[data.id];
				if (listener) {
					listener.reject(err);
				}
				console.error(err);
			}
			delete this.reqResListeners[data.id];
		}
	}
}
