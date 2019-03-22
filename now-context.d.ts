import { PolymerElement } from '@polymer/polymer';
export declare class AjaxRequest {
    private _authorization;
    private _method;
    private _params;
    private _payload;
    private _response;
    private _responseType;
    private _requestUrl;
    private _status;
    private _statusText;
    private _userAuthorizationString;
    private _withCredentials;
    constructor(obj?: any);
    authorization: string;
    method: string;
    params: any;
    payload: any;
    response: any;
    responseType: string;
    requestUrl: string;
    status: number;
    statusText: string;
    userAuthorizationString: string;
    withCredentials: boolean;
}
export declare class ContextItem {
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
export declare class PubSubListener {
    private _eventName;
    protected _handler: any;
    private _context;
    constructor(eventName: any, handler: any, context?: any);
    eventName: string | Symbol;
    handler: any;
    context: any;
}
export declare class ReqResListener extends PubSubListener {
    private _resolve;
    private _reject;
    private _id;
    constructor(eventName: any, handler: any, context?: any);
    id: number;
    handler: any;
    resolve: any;
    reject: any;
}
export declare class PubSubEvent {
    private _eventName;
    private _listeners;
    constructor(eventName?: any);
    eventName: string | Symbol;
    listeners: PubSubListener[];
}
export declare class PubSub {
    private _events;
    private _history;
    constructor();
    events: any;
    history: any[];
    on(eventName: any, fn: any, context: any): void;
    private createListener;
    off(eventName: any, fn: any): void;
    trigger(eventName: any, data: any): void;
    private _listenerExists;
    private _updateHistory;
}
export declare type ReqResFetchAjaxConfig = {
    method: string;
    params?: any;
    payload?: any;
    url: string;
    responseType?: string;
    withCredentials?: boolean;
    userAuthorizationString?: string;
    headers?: any;
};
export declare type ReqResFetchConfig = {
    id?: string | number;
    idKey: string;
    ajax: ReqResFetchAjaxConfig;
};
export declare class NowContext extends PolymerElement {
    static is: string;
    static readonly template: HTMLTemplateElement;
    context: any;
    readonly is: string;
    readonly store: any;
    UPDATED_EVENT: symbol;
    ADDED_EVENT: symbol;
    DELETED_EVENT: symbol;
    private _store;
    private pubsub;
    private worker;
    private onWorkerMsg;
    private globalId;
    private reqResListeners;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _createContextItem;
    private _updateContext;
    private _getContextKey;
    addStoreItem(item: any, idKey: string): ContextItem | null;
    removeStoreItem(itemId: any): ContextItem | null;
    findContextItem(contextItemKey: any): ContextItem | null;
    trigger(eventName: any, data: any): any;
    on(eventName: any, fn: any, context: any): void;
    off(eventName: any, fn: any): void;
    fetch(payload: any): any;
    private _sendWorkerMsg;
    private _onWorkerMsg;
}
