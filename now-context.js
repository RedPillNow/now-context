var Now;
(function (Now) {
    class AjaxRequest {
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
                pubsub: Object
            };
        }
        connectedCallback() {
            super.connectedCallback();
            window['NowContext'] = this;
            this.listenEvt('nowcontextget', this._onGetRequest, this);
            this.listenEvt('nowcontextput', this._onPutRequest, this);
            this.listenEvt('nowcontextpost', this._onPostRequest, this);
            this.listenEvt('nowcontextdelete', this._onDeleteRequest, this);
            this.listenEvt('nowcontextpatch', this._onPatchRequest, this);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
        }
        _onGetRequest(detail) {
            if (detail) {
                let ajax = this.$.getAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
                ajax.contentType = detail.ajax.contentType || 'application/json';
                return ajax.generateRequest().completes
                    .then((ironRequest) => {
                    this.triggerEvt('nowContextGetReqDone', ironRequest.response);
                    return this._updateContext(ironRequest, ajax, detail);
                })
                    .catch((err) => {
                    throw new Error(NowContext.is + '.onGetRequest failed');
                });
            }
            else {
                throw new Error(NowContext.is + ':iron-signal-nowcontextget: No detail provided in signal');
            }
        }
        _onPutRequest(detail) {
            if (detail) {
                let ajax = this.$.putAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
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
            }
            else {
                throw new Error(NowContext.is + ',nowcontextput: No detail provided in signal');
            }
        }
        _onPostRequest(detail) {
            if (detail) {
                let ajax = this.$.postAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
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
            }
            else {
                throw new Error(NowContext.is + ',nowcontextpost: No detail provided in signal');
            }
        }
        _onDeleteRequest(detail) {
            if (detail) {
                let ajax = this.$.deleteAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
                ajax.contentType = detail.ajax.contentType || 'application/json';
                return ajax.generateRequest().completes;
            }
            else {
                throw new Error(NowContext.is + ',nowcontextdelete: No detail provided in signal');
            }
        }
        _onPatchRequest(detail) {
            if (detail) {
                let ajax = this.$.patchAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
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
            }
            else {
                throw new Error(NowContext.is + ',nowcontextpatch: No detail provided in signal');
            }
        }
        _getAjaxRequest(ironRequest, ajax) {
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
        _createContextItem(ironRequest, ajaxRequest, idKey) {
            if (ironRequest && ajaxRequest) {
                let contextItem = new Now.ContextItem();
                contextItem.idKey = idKey;
                contextItem.model = ironRequest.response;
                contextItem.lastAjaxRequest = ajaxRequest;
                return contextItem;
            }
            return null;
        }
        _updateContext(ironRequest, ajax, detail) {
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
            let pubsub = this.get('pubsub');
            pubsub.trigger(eventName, data);
        }
        listenEvt(eventName, fn, context) {
            let pubsub = this.get('pubsub');
            pubsub.on(eventName, fn, context);
        }
        unListenEvt(eventName, fn) {
            let pubsub = this.get('pubsub');
            pubsub.off(eventName, fn);
        }
    }
    NowElements.NowContext = NowContext;
})(NowElements || (NowElements = {}));
customElements.define(NowElements.NowContext.is, NowElements.NowContext);

//# sourceMappingURL=now-context.js.map
