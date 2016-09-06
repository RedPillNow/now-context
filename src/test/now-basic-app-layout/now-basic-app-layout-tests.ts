/// <reference path="../../../typings/index.d.ts"/>
/// <reference path="../../now-basic-app-layout.ts"/>

/* No TS definitions for WebComponentTester, so use declare. */
 declare var fixture;
 declare var flush;
 declare var stub;

/**
 * Tests for my-view1.
 */
describe('now-basic-app-layoutp-test tests', function () {
	let element: NowElements.BasicAppLayout;

	before(function () {
		element = fixture('basic');
	});

	beforeEach(function () {
	});

	afterEach(function () {
	});

	it('should be instantiated', function() {
		var element = fixture('basic');
		chai.expect(element.is).equals('now-basic-app-layout');
	});
});
