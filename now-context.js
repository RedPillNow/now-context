var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NowContext_1;
import { customElement, property } from '@polymer/decorators';
import { PolymerElement, html } from '@polymer/polymer';
export class ContextItem {
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
    constructor(eventName, handler, context) {
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
        }
        else {
            throw new Error('The eventName cannot be null, undefined or empty string');
        }
    }
    get handler() {
        return this._handler;
    }
    set handler(handler) {
        if (handler) {
            if (typeof handler === 'function') {
                this._handler = handler;
            }
            else {
                throw new Error('The handler must be a function, you passed in a ' + typeof handler);
            }
        }
        else {
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
    constructor(eventName, handler, context) {
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
    constructor(eventName) {
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
    constructor() {
        this._history = [];
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
    on(eventName, fn, context) {
        if (!this._listenerExists(eventName, fn, context)) {
            this.createListener(eventName, fn, context, false);
        }
        else {
            console.warn('Listener for ' + eventName + ' with callback ', fn, ' already exists!');
        }
    }
    createListener(eventName, fn, context, isReqRes) {
        let listener = null;
        if (isReqRes) {
            listener = new ReqResListener(eventName, fn, context);
        }
        else {
            listener = new PubSubListener(eventName, fn, context);
        }
        this.events[eventName] = this.events[eventName] || new PubSubEvent(eventName);
        let listeners = this.events[eventName].listeners;
        listeners.push(listener);
        this.events[eventName].listeners = listeners;
    }
    off(eventName, fn) {
        if (this.events[eventName]) {
            for (let i = 0; i < this.events[eventName].listeners.length; i++) {
                let listener = this.events[eventName].listeners[i];
                if (listener.handler === fn) {
                    this.events[eventName].listeners.splice(i, 1);
                    break;
                }
            }
        }
    }
    trigger(eventName, data) {
        let executedListeners = [];
        if (this.events[eventName]) {
            let listeners = this.events[eventName].listeners;
            listeners.forEach((listener) => {
                if (listener.context && listener.handler && listener.handler.call) {
                    try {
                        listener.handler.call(listener.context, data);
                        executedListeners.push(listener);
                    }
                    catch (e) {
                        throw new Error('An error occurred executing the listener: ' + e.message);
                    }
                }
                else {
                    if (listener.handler && typeof listener.handler === 'function') {
                        listener.handler(data);
                        executedListeners.push(listener);
                    }
                    else {
                        throw new Error('It appears that the ' + eventName + ' handler is not a function!');
                    }
                }
            });
        }
        this._updateHistory(eventName, executedListeners, data);
    }
    _listenerExists(eventName, fn, context) {
        if (eventName && context) {
            let event = this.events[eventName];
            if (event) {
                let found = event.listeners.filter((item, idx, arr) => {
                    return item.context === context && item.handler === fn && item.eventName === eventName;
                });
                return found && found.length > 0;
            }
        }
        return false;
    }
    _updateHistory(eventName, listeners, data) {
        let dispatchedEvts = this.history;
        let evtObj = {
            time: new Date(),
            eventName: eventName,
            listeners: listeners,
            payload: data
        };
        dispatchedEvts.push(evtObj);
        this.history = dispatchedEvts;
    }
}
let NowContext = NowContext_1 = class NowContext extends PolymerElement {
    constructor() {
        super();
        this.UPDATED_EVENT = Symbol('nowContextItemUpdated');
        this.ADDED_EVENT = Symbol('nowContextItemAdded');
        this.DELETED_EVENT = Symbol('nowContextItemDeleted');
        this._store = {};
        this.globalId = 0;
        this.reqResListeners = {};
        this.pubsub = new PubSub();
    }
    static get template() {
        return html `
				<style>
					:host {
						display: none;
					}
				</style>
			`;
    }
    get is() {
        return NowContext_1.is;
    }
    get store() {
        return this._store;
    }
    connectedCallback() {
        super.connectedCallback();
        window.NowContext = this;
        const loadedEvt = new CustomEvent('now-context-loaded', { detail: this });
        document.dispatchEvent(loadedEvt);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    addStoreItem(item, idKey) {
        let contextItem = null;
        let contextItemKey = null;
        if (contextItem && item instanceof ContextItem) {
            contextItem = item;
        }
        else {
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
        }
        else {
            contextItemKey = contextItem.id;
        }
        this._store[contextItemKey] = contextItem;
        this._setContext(this.store);
        return contextItem;
    }
    removeStoreItem(itemId) {
        let contextItem = this.findContextItem(itemId);
        if (contextItem) {
            delete this._store[contextItem.id];
            this._setContext(this.store);
            this.trigger(this.DELETED_EVENT, contextItem);
        }
        else {
            console.info('now-context: Store item with ID ' + itemId + ' not found. Nothing removed');
        }
        return contextItem;
    }
    findContextItem(contextItemKey) {
        let context = this.store;
        if (context.hasOwnProperty(contextItemKey)) {
            return context[contextItemKey];
        }
        return null;
    }
    trigger(eventName, data) {
        return this.pubsub.trigger(eventName, data);
    }
    on(eventName, fn, context) {
        this.pubsub.on(eventName, fn, context);
    }
    off(eventName, fn) {
        this.pubsub.off(eventName, fn);
    }
};
NowContext.is = 'now-context';
__decorate([
    property({
        type: Object,
        notify: true,
        readOnly: true
    })
], NowContext.prototype, "context", void 0);
NowContext = NowContext_1 = __decorate([
    customElement('now-context')
], NowContext);
export { NowContext };
//# sourceMappingURL=now-context.js.map