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
        attached(): void;
        onGetRequest(evt: CustomEvent): any;
        onPutRequest(evt: CustomEvent): any;
        onPostRequest(evt: CustomEvent): any;
        onDeleteRequest(evt: CustomEvent): any;
        onPatchRequest(evt: CustomEvent): any;
        getAjaxRequest(ironRequest: any, ajax: any): Now.AjaxRequest;
        getContextItem(ironRequest: any, ajaxRequest: Now.AjaxRequest, idKey: string): Now.ContextItem;
        private updateContext(ironRequest, ajax, detail);
        private getContextKey(ajaxReq, contextItem);
        findContextItem(contextItemKey: any): Now.ContextItem;
        private _onRequestResponse(evt);
        private _dispatchEvent(options);
    }
}
