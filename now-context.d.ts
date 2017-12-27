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
        eventName: string;
        handler: any;
        context: any;
    }
    class PubSub {
        private _listeners;
        constructor();
        listeners: any;
        on(eventName: any, fn: any, context: any): void;
        off(eventName: any, fn: any): void;
        trigger(eventName: any, data: any): void;
    }
}
declare namespace NowElements {
    class NowContext extends NowElements.BaseElement {
        static readonly is: string;
        static readonly properties: {
            context: {
                type: ObjectConstructor;
                value: {};
                notify: boolean;
            };
        };
        constructor();
        connectedCallback(): void;
        disconnectedCallback(): void;
        private _onGetRequest(evt);
        private _onPutRequest(evt);
        private _onPostRequest(evt);
        private _onDeleteRequest(evt);
        private _onPatchRequest(evt);
        private _getAjaxRequest(ironRequest, ajax);
        private _createContextItem(ironRequest, ajaxRequest, idKey);
        private _updateContext(ironRequest, ajax, detail);
        private _getContextKey(ajaxReq, contextItem);
        findContextItem(contextItemKey: any): Now.ContextItem;
        private _onRequestResponse(evt);
        private _dispatchEvent(options);
    }
}
