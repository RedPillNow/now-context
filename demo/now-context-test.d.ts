import { PolymerElement } from '@polymer/polymer/polymer-element';
import '@polymer/paper-item/paper-item.js';
export declare class NowContextTest extends PolymerElement {
    static is: string;
    readonly is: string;
    static readonly template: HTMLTemplateElement;
    context: any;
    count: number;
    getReqCount: number;
    contextDisplay: any[];
    getSameDisabled: boolean;
    connectedCallback(): void;
    _isGetSameDisabled(count: any): boolean;
    onContextItemAdded(item: any): void;
    getNext(evt: any, detail: any): void;
    getSame(evt: any, detail: any): void;
    getReqResPayload(): {
        ajax: {
            method: string;
            url: string;
            idKey: string;
        };
        idKey: string;
    };
    getPosts(evt: any, detail: any): void;
    clearDisplay(evt: any): void;
    onContextItemUpdated(data: any): void;
    triggerEvent(evt: any): void;
    onCustomEvent(data: any): void;
}
