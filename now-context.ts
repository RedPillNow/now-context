import { customElement, property } from '@polymer/decorators';
import { PolymerElement, html } from '@polymer/polymer';

export class ContextItem {
	private _element: any;
	private _id: string;
	private _idKey: string;
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
	private _history: any[] = [];

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
		let listener: PubSubListener|ReqResListener|null = null;
		if (isReqRes) {
			listener = new ReqResListener(eventName, fn, context);
		} else {
			listener = new PubSubListener(eventName, fn, context);
		}
		this.events[eventName] = this.events[eventName] || new PubSubEvent(eventName);
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
		let executedListeners: PubSubListener[]= [];
		if (this.events[eventName]) {
			let listeners = this.events[eventName].listeners;
			listeners.forEach((listener: PubSubListener) => {
				if (listener.context && listener.handler && listener.handler.call) {
					try {
						listener.handler.call(listener.context, data);
						executedListeners.push(listener);
					}catch(e) {
						throw new Error('An error occurred executing the listener: ' + e.message);
					}
				} else {
					if (listener.handler && typeof listener.handler === 'function') {
						listener.handler(data);
						executedListeners.push(listener);
					} else {
						throw new Error('It appears that the ' + eventName + ' handler is not a function!');
					}
				}
			});
		}
		this._updateHistory(eventName, executedListeners, data);
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
			let event: PubSubEvent = this.events[eventName];
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

/**
 * Type representing the properties to set on a AjaxRequest provided by
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
	 * @deprecated use headers
	 */
	userAuthorizationString?: string;
	/**
	 * The headers to set as part of the ajax request
	 */
	headers?: any;
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
 * @author Keith Strickland <keith@redpillcom>
 */
@customElement('now-context')
export class NowContext extends PolymerElement {
	static is: string = 'now-context';
	static get template() {
		return html`
				<style>
					:host {
						display: none;
					}
				</style>
			`;
	}
	/* static get importMeta() {
		return import.meta;
	} */
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
	 * @type {PubSub}
	 */
	private pubsub: PubSub;

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
		this.pubsub = new PubSub();
	}
	/**
	 * Subscribe to relevant PubSub events
	 */
	connectedCallback() {
		// Create a global for interacting with this element
		super.connectedCallback();
		window.NowContext = this;
		const loadedEvt = new CustomEvent('now-context-loaded', { detail: this });
		document.dispatchEvent(loadedEvt);
	}
	/**
	 * UnSubscribe to relevant PubSub events and worker message event
	 *
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}
	/**
	 * Get a ContextItem based on the ironRequest
	 * @param {any} ironRequest
	 * @param {AjaxRequest} ajaxRequest
	 * @returns {ContextItem}
	 */
	/* private _createContextItem(ajaxRequest: AjaxRequest, idKey: string): ContextItem|null {
		if (ajaxRequest) {
			let contextItem = new ContextItem();
			contextItem.idKey = idKey;
			contextItem.model = ajaxRequest.response;
			contextItem.lastAjaxRequest = ajaxRequest;
			return contextItem;
		}
		return null;
	} */
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
	/* private _updateContext(ajaxReq: AjaxRequest, detail: any): boolean {
		try {
			let response = ajaxReq.response;
			if (response) {
				let contextItem = this._createContextItem(ajaxReq, detail.idKey);
				if (contextItem) {
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
			}
			return false;
		} catch (e) {
			return false;
		}
		return false;
	} */
	/**
	 * Determine the context key and return it
	 * @private
	 * @param {ContextItem} contextItem
	 * @returns {string}
	 */
	/* private _getContextKey(contextItem: ContextItem): string {
		let contextItemKey: string|null = null;
		if (!contextItem.id && contextItem.idKey) {
			contextItemKey = contextItem.idKey;
		} else {
			contextItemKey = contextItem.id;
		}
		return contextItemKey;
	} */
	/**
	 * Add an item to the store. This should be the only way possible of adding to the store
	 * @param {any} item
	 * @param {any} idKey
	 * @returns {ContextItem} Item added/updated
	 */
	addStoreItem(item: any, idKey: string): ContextItem|null {
		let contextItem: ContextItem|null = null;
		let contextItemKey: string|number|null = null;
		if (contextItem && item instanceof ContextItem) {
			contextItem = item;
		} else {
			contextItem = new ContextItem();
			contextItem.idKey = idKey;
			contextItem.model = item;
		}
		let protocolRegEx = /(http:|https:){1}/;
		if (contextItem.idKey === 'url' || protocolRegEx.test(contextItem.idKey)) {
			contextItemKey = contextItem.idKey;
			if (!contextItemKey) {
				contextItemKey = new Date().getTime();
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
	 * @returns {ContextItem} Item removed from the store
	 */
	removeStoreItem(itemId): ContextItem|null {
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
	 * @returns {ContextItem}
	 */
	findContextItem(contextItemKey): ContextItem|null {
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
}
