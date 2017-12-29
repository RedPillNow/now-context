var Now;
(function (Now) {
    class AjaxRequest {
        constructor(obj) {
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
    Now.AjaxRequest = AjaxRequest;
    class ContextItem {
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
    Now.ContextItem = ContextItem;
    class PubSubListener {
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
    Now.PubSubListener = PubSubListener;
    class ReqResListener extends PubSubListener {
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
    Now.ReqResListener = ReqResListener;
    class PubSubEvent {
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
    Now.PubSubEvent = PubSubEvent;
    class PubSub {
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
        on(eventName, fn, context) {
            if (!this._listenerExists(eventName, fn, context)) {
                let listener = new PubSubListener(eventName, fn, context);
                this.events[eventName] = this.events[eventName] || new Now.PubSubEvent(eventName);
                let listeners = this.events[eventName].listeners;
                listeners.push(listener);
                this.events[eventName].listeners = listeners;
            }
            else {
                console.warn('Listener for ' + eventName + ' with callback ', fn, ' already exists!');
            }
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
            let listeners = [];
            if (this.events[eventName]) {
                this.events[eventName].listeners.forEach((listener) => {
                    if (listener.context && listener.handler && listener.handler.call) {
                        listeners.push(listener);
                        listener.handler.call(listener.context, data);
                    }
                    else {
                        if (listener.handler && typeof listener.handler === 'function') {
                            listeners.push(listener);
                            listener.handler(data);
                        }
                        else {
                            throw new Error('It appears that the ' + eventName + ' handler is not a function!');
                        }
                    }
                });
            }
            this._updateHistory(eventName, listeners);
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
        _updateHistory(eventName, listeners) {
            let dispatchedEvts = this.history;
            let evtObj = {
                time: new Date(),
                eventName: eventName,
                listeners: listeners
            };
            dispatchedEvts.push(evtObj);
            this.history = dispatchedEvts;
        }
    }
    Now.PubSub = PubSub;
})(Now || (Now = {}));
var NowElements;
(function (NowElements) {
    class NowContext extends NowElements.BaseElement {
        constructor() {
            super();
            this.globalId = 0;
            this.reqResListeners = {};
            this.pubsub = new Now.PubSub();
        }
        static get is() { return 'now-context'; }
        static get properties() {
            return {
                context: {
                    type: Object,
                    value: {},
                    notify: true
                },
            };
        }
        connectedCallback() {
            super.connectedCallback();
            window.NowContext = this;
            if (window.Worker) {
                this.worker = new Worker(this.resolveUrl('now-context-worker.js'));
                this.onWorkerMsg = this._onWorkerMsg.bind(this);
                this.worker.addEventListener('message', this.onWorkerMsg);
            }
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (window.Worker) {
                this.worker.removeEventListener('message', this.onWorkerMsg);
            }
        }
        _createContextItem(ajaxRequest, idKey) {
            if (ajaxRequest) {
                let contextItem = new Now.ContextItem();
                contextItem.idKey = idKey;
                contextItem.model = ajaxRequest.response;
                contextItem.lastAjaxRequest = ajaxRequest;
                return contextItem;
            }
            return null;
        }
        _updateContext(ajaxReq, detail) {
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
                    }
                    else {
                        this.context[contextItemKey] = contextItem;
                        this.notifyPath('context.*', this.context[contextItemKey]);
                    }
                    this.triggerEvt(evtName, contextItem);
                    return true;
                }
                return false;
            }
            catch (e) {
                return false;
            }
        }
        _getContextKey(ajaxReq, contextItem) {
            let contextItemKey = null;
            if (Array.isArray(ajaxReq.response)) {
                contextItemKey = ajaxReq.requestUrl;
            }
            else {
                contextItemKey = contextItem.id;
            }
            return contextItemKey;
        }
        findContextItem(contextItemKey) {
            let context = this.get('context');
            if (context.hasOwnProperty(contextItemKey)) {
                return context[contextItemKey];
            }
            return null;
        }
        triggerEvt(eventName, data) {
            this.pubsub.trigger(eventName, data);
        }
        listenEvt(eventName, fn, context) {
            this.pubsub.on(eventName, fn, context);
        }
        unListenEvt(eventName, fn) {
            this.pubsub.off(eventName, fn);
        }
        reqres(payload) {
            return this._sendWorkerMsg(payload);
        }
        _sendWorkerMsg(payload) {
            const msgId = this.globalId++;
            let listener = new Now.ReqResListener('reqRes' + msgId, null);
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
        _onWorkerMsg(evt) {
            let data = evt.data;
            try {
                let ajaxReq = new Now.AjaxRequest(data.ajaxReq);
                this._updateContext(ajaxReq, { idKey: data.idKey });
                this.reqResListeners[data.id].resolve(ajaxReq);
                delete this.reqResListeners[data.id];
            }
            catch (err) {
                this.reqResListeners[data.id].reject(err);
            }
        }
    }
    NowElements.NowContext = NowContext;
})(NowElements || (NowElements = {}));
customElements.define(NowElements.NowContext.is, NowElements.NowContext);

//# sourceMappingURL=now-context.js.map
