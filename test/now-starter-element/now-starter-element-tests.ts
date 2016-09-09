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
		element = fixture('now-starter-element');
	});

	after(function () {
	});

	beforeEach(function () {
	});

	afterEach(function () {
	});

	it('should be instantiated', function() {
		chai.expect(element.is).equals('now-starter-element');
	});
});
