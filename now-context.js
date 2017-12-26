var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Now;
(function (Now) {
    var AjaxRequest = (function () {
        function AjaxRequest() {
        }
        Object.defineProperty(AjaxRequest.prototype, "method", {
            get: function () {
                return this._method;
            },
            set: function (method) {
                this._method = method;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AjaxRequest.prototype, "params", {
            get: function () {
                return this._params;
            },
            set: function (params) {
                this._params = params;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AjaxRequest.prototype, "payload", {
            get: function () {
                return this._payload;
            },
            set: function (payload) {
                this._payload = payload;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AjaxRequest.prototype, "response", {
            get: function () {
                return this._response;
            },
            set: function (response) {
                this._response = response;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AjaxRequest.prototype, "responseType", {
            get: function () {
                return this._responseType;
            },
            set: function (responseType) {
                this._responseType = responseType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AjaxRequest.prototype, "requestUrl", {
            get: function () {
                return this._requestUrl;
            },
            set: function (requestUrl) {
                this._requestUrl = requestUrl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AjaxRequest.prototype, "status", {
            get: function () {
                return this._status;
            },
            set: function (status) {
                this._status = status;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AjaxRequest.prototype, "statusText", {
            get: function () {
                return this._statusText;
            },
            set: function (statusText) {
                this._statusText = statusText;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AjaxRequest.prototype, "withCredentials", {
            get: function () {
                return this._withCredentials;
            },
            set: function (withCredentials) {
                this._withCredentials = withCredentials;
            },
            enumerable: true,
            configurable: true
        });
        return AjaxRequest;
    }());
    Now.AjaxRequest = AjaxRequest;
    var ContextItem = (function () {
        function ContextItem() {
        }
        Object.defineProperty(ContextItem.prototype, "element", {
            get: function () {
                return this._element;
            },
            set: function (element) {
                this._element = element;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ContextItem.prototype, "id", {
            get: function () {
                if (this.model && !this._id) {
                    this._id = this.model[this.idKey];
                }
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ContextItem.prototype, "idKey", {
            get: function () {
                return this._idKey;
            },
            set: function (idKey) {
                this._idKey = idKey;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ContextItem.prototype, "lastAjaxRequest", {
            get: function () {
                return this._lastAjaxRequest;
            },
            set: function (lastAjaxRequest) {
                this._lastAjaxRequest = lastAjaxRequest;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ContextItem.prototype, "model", {
            get: function () {
                return this._model;
            },
            set: function (model) {
                this._model = model;
            },
            enumerable: true,
            configurable: true
        });
        return ContextItem;
    }());
    Now.ContextItem = ContextItem;
})(Now || (Now = {}));
var NowElements;
(function (NowElements) {
    var NowContext = (function (_super) {
        __extends(NowContext, _super);
        function NowContext() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(NowContext, "is", {
            get: function () { return 'now-context'; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NowContext, "properties", {
            get: function () {
                return {
                    context: {
                        type: Object,
                        value: {},
                        notify: true
                    }
                };
            },
            enumerable: true,
            configurable: true
        });
        NowContext.prototype.attached = function () {
            window['NowContext'] = this;
            document.addEventListener('nowcontextget', this.onGetRequest);
            document.addEventListener('nowcontextput', this.onPutRequest);
            document.addEventListener('nowcontextpost', this.onPostRequest);
            document.addEventListener('nowcontextdelete', this.onDeleteRequest);
            document.addEventListener('nowcontextpatch', this.onPatchRequest);
            document.addEventListener('nowcontextreqres', this._onRequestResponse);
        };
        NowContext.prototype.onGetRequest = function (evt) {
            var _this = this;
            var detail = evt.detail;
            if (detail) {
                var ajax_1 = this.$.getAjax;
                ajax_1.params = detail.ajax.parameters;
                ajax_1.handleAs = detail.ajax.handleAs || 'json';
                ajax_1.url = detail.ajax.url;
                ajax_1.contentType = detail.ajax.contentType || 'application/json';
                return ajax_1.generateRequest().completes
                    .then(function (ironRequest) {
                    return _this.updateContext(ironRequest, ajax_1, detail);
                })
                    .catch(function (err) {
                    throw new Error(NowContext.is + '.onGetRequest failed');
                });
            }
            else {
                throw new Error(NowContext.is + ':iron-signal-nowcontextget: No detail provided in signal');
            }
        };
        NowContext.prototype.onPutRequest = function (evt) {
            var detail = evt.detail;
            if (detail) {
                var ajax = this.$.putAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
                ajax.contentType = detail.ajax.contentType || 'application/json';
                ajax.body = detail.ajax.payload;
                return ajax.generateRequest().completes;
            }
            else {
                throw new Error(NowContext.is + ',nowcontextput: No detail provided in signal');
            }
        };
        NowContext.prototype.onPostRequest = function (evt) {
            var detail = evt.detail;
            if (detail) {
                var ajax = this.$.postAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
                ajax.contentType = detail.ajax.contentType || 'application/json';
                ajax.body = detail.ajax.payload;
                return ajax.generateRequest().completes;
            }
            else {
                throw new Error(NowContext.is + ',nowcontextpost: No detail provided in signal');
            }
        };
        NowContext.prototype.onDeleteRequest = function (evt) {
            var detail = evt.detail;
            if (detail) {
                var ajax = this.$.deleteAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
                ajax.contentType = detail.ajax.contentType || 'application/json';
                return ajax.generateRequest().completes;
            }
            else {
                throw new Error(NowContext.is + ',nowcontextdelete: No detail provided in signal');
            }
        };
        NowContext.prototype.onPatchRequest = function (evt) {
            var detail = evt.detail;
            if (detail) {
                var ajax = this.$.patchAjax;
                ajax.params = detail.ajax.parameters;
                ajax.handleAs = detail.ajax.handleAs || 'json';
                ajax.url = detail.ajax.url;
                ajax.contentType = detail.ajax.contentType || 'application/json';
                ajax.body = detail.ajax.payload;
                return ajax.generateRequest().completes;
            }
            else {
                throw new Error(NowContext.is + ',nowcontextpatch: No detail provided in signal');
            }
        };
        NowContext.prototype.getAjaxRequest = function (ironRequest, ajax) {
            if (ironRequest && ajax) {
                var ajaxReq = new Now.AjaxRequest();
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
        };
        NowContext.prototype.getContextItem = function (ironRequest, ajaxRequest, idKey) {
            if (ironRequest && ajaxRequest) {
                var contextItem = new Now.ContextItem();
                contextItem.idKey = idKey;
                contextItem.model = ironRequest.response;
                contextItem.lastAjaxRequest = ajaxRequest;
                return contextItem;
            }
            return null;
        };
        NowContext.prototype.updateContext = function (ironRequest, ajax, detail) {
            try {
                var response = ironRequest.response;
                if (response) {
                    var ajaxReq = this.getAjaxRequest(ironRequest, ajax);
                    var contextItem = this.getContextItem(ironRequest, ajaxReq, detail.ajax.idKey);
                    var contextItemKey = this.getContextKey(ajaxReq, contextItem);
                    var isUrl = false;
                    if ((contextItemKey && contextItemKey.indexOf) && (contextItemKey.indexOf('http:') > -1 || contextItemKey.indexOf('https:') > -1)) {
                        isUrl = true;
                    }
                    var existingContextItem = this.findContextItem(contextItemKey);
                    if (existingContextItem) {
                        contextItem = Object.assign(existingContextItem, contextItem);
                    }
                    if (!isUrl) {
                        var path = 'context.' + contextItemKey;
                        this.set(path, contextItem);
                    }
                    else {
                        this.context[contextItemKey] = contextItem;
                        this.notifyPath('context.*', this.context[contextItemKey]);
                    }
                    return true;
                }
                return false;
            }
            catch (e) {
                return false;
            }
        };
        NowContext.prototype.getContextKey = function (ajaxReq, contextItem) {
            var contextItemKey = null;
            if (Array.isArray(ajaxReq.response)) {
                contextItemKey = ajaxReq.requestUrl;
            }
            else {
                contextItemKey = contextItem.id;
            }
            return contextItemKey;
        };
        NowContext.prototype.findContextItem = function (contextItemKey) {
            var context = this.get('context');
            if (context.hasOwnProperty(contextItemKey)) {
                return context[contextItemKey];
            }
            return null;
        };
        NowContext.prototype._onRequestResponse = function (evt) {
            var detail = evt.detail;
        };
        NowContext.prototype._dispatchEvent = function (options) {
            var event = null;
            options = options || {};
            if (options.type && options.target) {
                var node = options.target || window;
                var bubbles = options.bubbles === undefined ? true : options.bubbles;
                var cancelable = Boolean(options.cancelable);
                event = new Event(options.type, { bubbles: bubbles, cancelable: cancelable });
                event['detail'] = options.detail;
                node.dispatchEvent(event);
            }
            else {
                throw new Error('Event options must include an event "type" and event "target"');
            }
            return event;
        };
        return NowContext;
    }(NowElements.BaseElement));
    NowElements.NowContext = NowContext;
})(NowElements || (NowElements = {}));
customElements.define(NowElements.NowContext.is, NowElements.NowContext);

//# sourceMappingURL=now-context.js.map
