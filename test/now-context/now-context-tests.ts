/* No TS definitions for WebComponentTester, so use declare. */
 declare var fixture;
 declare var flush;
 declare var stub;

/**
 * Tests for now-context.
 */
describe('now-context tests', function () {
	let element: Now.NowContext;

	before(function () {
		element = fixture('now-context');
	});

	after(function () {
	});

	beforeEach(function () {
	});

	afterEach(function () {
	});

	it('should be instantiated', function() {
		chai.expect(Now.NowContext.is).equals('now-context');
	});
});
