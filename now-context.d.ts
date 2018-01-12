declare namespace Now {
    class AjaxRequest {
        private _method;
        private _params;
        private _payload;
        private _response;
        private _responseType;
        private _requestUrl;
        private _status;
        private _statusText;
        private _withCredentials;
        constructor(obj?: any);
        method: string;
        params: any;
        payload: any;
        response: any;
        responseType: string;
        requestUrl: string;
        status: number;
        statusText: string;
        withCredentials: boolean;
    }
    class ContextItem {
        private _element;
        private _id;
        private _idKey;
        private _lastAjaxRequest;
        private _model;
        element: any;
        readonly id: string;
        idKey: string;
        lastAjaxRequest: AjaxRequest;
        model: any;
    }
    class PubSubListener {
        private _eventName;
        protected _handler: any;
        private _context;
        constructor(eventName: any, handler: any, context?: any);
        eventName: string | Symbol;
        handler: any;
        context: any;
    }
    class ReqResListener extends PubSubListener {
        private _resolve;
        private _reject;
        private _id;
        protected _handler: any;
        constructor(eventName: any, handler: any, context?: any);
        id: number;
        handler: any;
        resolve: any;
        reject: any;
    }
    class PubSubEvent {
        private _eventName;
        private _listeners;
        constructor(eventName?: any);
        eventName: string | Symbol;
        listeners: PubSubListener[];
    }
    class PubSub {
        private _events;
        private _history;
        constructor();
        events: any;
        history: any[];
        on(eventName: any, fn: any, context: any): void;
        private createListener(eventName, fn, context?, isReqRes?);
        off(eventName: any, fn: any): void;
        trigger(eventName: any, data: any): void;
        private _listenerExists(eventName, fn, context);
        private _updateHistory(eventName, listeners);
    }
}
declare namespace NowElements {
    class NowContext extends Polymer.Element {
        static readonly is: string;
        static readonly properties: {
            context: {
                type: ObjectConstructor;
                notify: boolean;
                readOnly: boolean;
            };
        };
        readonly store: any;
        UPDATED_EVENT: symbol;
        ADDED_EVENT: symbol;
        DELETED_EVENT: symbol;
        private _store;
        private pubsub;
        private worker;
        private globalId;
        private reqResListeners;
        constructor();
        connectedCallback(): void;
        disconnectedCallback(): void;
        private _createContextItem(ajaxRequest, idKey);
        private _updateContext(ajaxReq, detail);
        private _getContextKey(ajaxReq, contextItem);
        addStoreItem(item: any, idKey: any): Now.ContextItem;
        removeStoreItem(itemId: any): Now.ContextItem;
        findContextItem(contextItemKey: any): Now.ContextItem;
        trigger(eventName: any, data: any): void;
        on(eventName: any, fn: any, context: any): void;
        off(eventName: any, fn: any): void;
        fetch(payload: any): Promise<{}>;
        private _sendWorkerMsg(payload);
        private _onWorkerMsg(evt);
    }
}
