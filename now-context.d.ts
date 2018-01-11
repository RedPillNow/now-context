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
        private _handler;
        private _context;
        constructor(eventName: any, handler: any, context?: any);
        eventName: any;
        handler: any;
        context: any;
	}
	class ReqResListener extends PubSubListener {
		private _resolve;
		private _reject;
		private _id;
		constructor(eventName: any, handler: any, context?: any);
		id: string;
		handler: any;
		resolve: any;
		reject: any;
	}
	class PubSubEvent {
		private _eventName;
		private _listeners;
		constructor()
		eventName: any;
		listeners: Now.PubSubListener[];
	}
    class PubSub {
		private _events;
		private _history;
        constructor();
		events: any;
		history: any[];
		on(eventName: any, fn: any, context: any): void;
		private createListener(eventName: string, fn: any, context?: any, isReqRes?: boolean);
        off(eventName: any, fn: any): void;
		trigger(eventName: any, data: any): void;
		private _listenerExists(eventName: string, fn: any, context: any): boolean;
		private _updateHistory(eventName: string, listeners: any[]);
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
		private readonly _store: any;
		private pubsub: Now.PubSub;
		private worker: Worker;
		private globalId: number;
		private reResListeners: any;
		UPDATED_EVENT: any;
		ADDED_EVENT: any;
		DELETED_EVENT: any;
        constructor();
        connectedCallback(): void;
        disconnectedCallback(): void;
        private _createContextItem(ironRequest, ajaxRequest, idKey);
        private _updateContext(ironRequest, ajax, detail);
		private _getContextKey(ajaxReq, contextItem);
		addStoreItem(item: any, idKey: string): Now.ContextItem;
		removeStoreItem(itemId: string): Now.ContextItem;
		findContextItem(contextItemKey: any): Now.ContextItem;
		trigger(eventName: any, data);
		on(eventName: any, fn, context);
		off(eventName: any, fn);
		fetch(payload);
		private _sendWorkerMsg(payload);
		private _onWorkerMsg(evt: MessageEvent);

    }
}
