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
		</style>
		<div class="layout horizontal">
			<button id="triggerEvt" on-click="triggerEvent">Trigger Event</button>
		</div>`;
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
    onContextItemUpdated(data) {
        console.log(NowContextTest_1.is, 'onNowContextContextUpdated, This is the handler for the nowContextItemUpdated pubsub event', data, 'Handler context=', this);
    }
    triggerEvent(evt) {
        NowContext.trigger('customEvent', { foo: 'bar', baz: 'bam', date: new Date() });
    }
    onCustomEvent(data) {
        console.log(this.is, 'onCustomEvent, data=', data);
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