'use strict';

const appBuilder = require('redpill-app-builder');
const version = require('./bump-version');

// Add any tasks that need to complete before the build here
appBuilder.build('./dist', './polymer.json')
	.then(function() {
		// Add any tasks that need to complete after the build here
	});
// Add any tasks that can complete in conjunction with the build here

/*
 * Bump the version if the version part is specified on the command line
 * @example
 * npm run build patch
 * npm run build minor
 * npm run build major
 *
 * The above will bump the version part number by 1
 **/
if (process.argv[2]) {
	version.bump(process.argv[2])
		.then((newVer) => {
			// console.log('bump promise resolved', newVer);
		});
}
