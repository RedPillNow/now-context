/// <reference path="bower_components/polymer-ts/polymer-ts.d.ts"/>
/// <reference path="bower_components/now-core/now-core.d.ts"/>

namespace NowElements {

	/**
	 * Example Polymer element for Red Pill applications.
	 *
	 * @author Kito D. Mann
	 */
	@component('now-starter-element')
	export class NowStarterElement extends NowElements.BaseElement {

		@property({type: String})
		prop1: string;
	}
}

NowElements.NowStarterElement.register();
