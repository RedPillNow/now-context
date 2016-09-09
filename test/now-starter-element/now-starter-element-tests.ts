/// <reference path="../../typings/index.d.ts"/>
/// <reference path="../../now-starter-element.ts"/>

/* No TS definitions for WebComponentTester, so use declare. */
 declare var fixture;
 declare var flush;
 declare var stub;

/**
 * Tests for now-starter-element.
 */
describe('now-starter-element tests', function () {
	let element: NowElements.NowStarterElement;

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
		chai.expect(element.is).equals('now-starter-element');
	});
});
