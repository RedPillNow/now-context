import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import {customElement, property} from '@polymer/decorators';
import '@polymer/paper-item/paper-item.js';

declare var NowContext;
@customElement('now-context-test')
export class NowContextTest extends PolymerElement {
	static is = 'now-context-test';
	get is() {
		return NowContextTest.is;
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

	@property({
		type: Object,
		notify: true
	})
	context: any;

	@property({type: Number})
	count: number = 0;

	@property({type: Number})
	getReqCount: number = 0;

	@property({
		type: Array,
		notify: true
	})
	contextDisplay: any[];

	@property({
		type: Boolean,
		computed: '_isGetSameDisabled(count)'
	})
	getSameDisabled: boolean = true;

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
			}
			this.push('contextDisplay', contextDispItem);
		}
	}

	onContextItemUpdated(data) {
		console.log(NowContextTest.is, 'onNowContextContextUpdated, This is the handler for the nowContextItemUpdated pubsub event', data, 'Handler context=', this);
	}

	triggerEvent(evt) {
		NowContext.trigger('customEvent', {foo: 'bar', baz: 'bam', date: new Date()});
	}

	onCustomEvent(data) {
		console.log(this.is, 'onCustomEvent, data=', data);
		alert('This is produced from the PubSub running the listener for customEvent on ' +  NowContextTest.is);
	}
}
