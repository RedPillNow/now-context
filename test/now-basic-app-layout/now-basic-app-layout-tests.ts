/// <reference path="../../typings/index.d.ts"/>
/// <reference path="../../now-basic-app-layout.ts"/>

/* No TS definitions for WebComponentTester, so use declare. */
 declare var fixture;
 declare var flush;
 declare var stub;

/**
 * Tests for now-basic-app-layout.
 */
describe('now-basic-app-layout-test tests', function () {
	let element: NowElements.BasicAppLayout;

	before(function () {
		element = fixture('basic');
	});

	after(function () {
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
