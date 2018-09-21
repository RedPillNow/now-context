var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NowContextTest_1;
import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property } from '@polymer/decorators';
import '@polymer/paper-item/paper-item.js';
let NowContextTest = NowContextTest_1 = class NowContextTest extends PolymerElement {
    constructor() {
        super(...arguments);
        this.count = 0;
        this.getReqCount = 0;
        this.getSameDisabled = true;
    }
    get is() {
        return NowContextTest_1.is;
    }
    static get template() {
        return html `
		<style>
			:host {
				display: block;
				box-sizing: border-box;
				font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
				font-size: 14px;
				line-height: 1.5;
			}
			paper-item:first-child {
				margin-top: 10px;
			}
			paper-item {
				margin-bottom: 10px;
				--paper-item: {
					border: 1px solid #afafaf;
				};
			}
			.label {
				font-size: 12px;
			}
			.value {
				font-size: 13px;
				font-weight: 500;
			}
			.title .value {
				font-size: 14px;
				font-weight: 600;
			}
			.getRequestCount {
				font-size: 12px;
			}
			.note {
				font-style: italic;
				font-weight: 600;
			}
		</style>
		<div class="layout horizontal">
			<button on-click="getNext">Get Next</button>
			<button on-click="getSame" disabled$="{{getSameDisabled}}">Get Same Record Again</button>
			<button on-click="getPosts">Get Posts</button>
			<button id="clearContext" on-click="clearDisplay">Clear Display</button>
			<button id="triggerEvt" on-click="triggerEvent">Trigger Event</button>
			<span class="flex"></span>
			<div class="getRequestCount">
				<span
					title="The number of network requests made. Driven by the now-context PubSub system">
					{{getReqCount}} GET requests have been made
				</span>
			</div>
		</div>
		<div>
			<p>In order to access the context there is a global variable called "NowContext.store". This will be the context object which contains all the responses (that were different).</p>
			<p>If an item does not have an id (for example the response was an array) then the url will be the key, otherwise the id is the key.</p>
			<p class="note">Open the console to see relevant messages</p>
		</div>
		<div id="contextDisplay">
			<template is="dom-repeat" items="{{contextDisplay}}" as="contextItem">
				<paper-item>
					<div class="layout vertical">
						<div class="layout horizontal title">
							<span class="value">{{contextItem.title}}</span>
						</div>
						<div class="layout horizontal">
							<span class="label">{{contextItem.idKey}}:</span>
							<span class="value">{{contextItem.id}}</span>
						</div>
						<div class="layout horizontal">
							<span class="label">URL:</span>
							<span class="value">{{contextItem.url}}</span>
						</div>
					</div>
				</paper-item>
			</template>
		</div>
		`;
    }
    connectedCallback() {
        super.connectedCallback();
        setTimeout(() => {
            NowContext.on(NowContext.UPDATED_EVENT, this.onContextItemUpdated);
            NowContext.on(NowContext.ADDED_EVENT, this.onContextItemAdded, this);
            NowContext.on('customEvent', this.onCustomEvent, this);
        }, 1000);
    }
    _isGetSameDisabled(count) {
        return !(count > 0);
    }
    onContextItemAdded(item) {
        if (item && Object.keys(item).length > 0) {
            let isArray = Array.isArray(item.model);
            let contextDispItem = {
                id: isArray ? item.lastAjaxRequest.requestUrl : item[item.idKey],
                idKey: item.idKey,
                url: item.lastAjaxRequest.requestUrl,
                title: isArray ? 'Array (' + item.model.length + ')' : item.model['title']
            };
            this.push('contextDisplay', contextDispItem);
        }
    }
    getNext(evt, detail) {
        this.count++;
        NowContext.fetch(this.getReqResPayload())
            .then((ajaxReq) => {
            this.getReqCount++;
        });
    }
    getSame(evt, detail) {
        if (this.count > 0) {
            NowContext.fetch(this.getReqResPayload())
                .then((ajaxReq) => {
                this.getReqCount++;
            });
        }
    }
    getReqResPayload() {
        return {
            ajax: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/' + this.count,
                idKey: 'id'
            },
            idKey: 'id'
        };
    }
    getPosts(evt, detail) {
        let payload = {
            ajax: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts'
            },
            idKey: 'url'
        };
        NowContext.fetch(payload)
            .then((ajaxReq) => {
            this.getReqCount++;
        });
    }
    clearDisplay(evt) {
        this.set('contextDisplay', []);
        this.set('count', 0);
    }
    onContextItemUpdated(data) {
        console.log(NowContextTest_1.is, 'onNowContextContextUpdated, This is the handler for the nowContextItemUpdated pubsub event', data, 'Handler context=', this);
    }
    triggerEvent(evt) {
        NowContext.trigger('customEvent');
    }
    onCustomEvent(data) {
        alert('This is produced from the PubSub running the listener for customEvent on ' + NowContextTest_1.is);
    }
};
NowContextTest.is = 'now-context-test';
__decorate([
    property({
        type: Object,
        notify: true
    })
], NowContextTest.prototype, "context", void 0);
__decorate([
    property({ type: Number })
], NowContextTest.prototype, "count", void 0);
__decorate([
    property({ type: Number })
], NowContextTest.prototype, "getReqCount", void 0);
__decorate([
    property({
        type: Array,
        notify: true
    })
], NowContextTest.prototype, "contextDisplay", void 0);
__decorate([
    property({
        type: Boolean,
        computed: '_isGetSameDisabled(count)'
    })
], NowContextTest.prototype, "getSameDisabled", void 0);
NowContextTest = NowContextTest_1 = __decorate([
    customElement('now-context-test')
], NowContextTest);
export { NowContextTest };
//# sourceMappingURL=now-context-test.js.map