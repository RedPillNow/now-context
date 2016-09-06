/// <reference path="../polymer-ts/polymer-ts.d.ts"/>

namespace NowElements {
	@component('now-basic-app-layout')
	export class BasicAppLayout extends polymer.Base {

		@property({type: String})
		prop1: string;
	}
}
NowElements.BasicAppLayout.register();
