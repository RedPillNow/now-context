/*
 Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

// Include promise polyfill for node 0.10 compatibility
require('es6-promise').polyfill();

// Include Gulp & tools we'll use
var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');
var historyApiFallback = require('connect-history-api-fallback');
var packageJson = require('./package.json');
var crypto = require('crypto');
var props = require('properties');
var url = require('url');
var proxy = require('proxy-middleware');
var replace = require('gulp-replace');
var plumber = require('gulp-plumber');
var gulpIf = require('gulp-if');
var gulpIgnore = require('gulp-ignore');
var size = require('gulp-size');
var minifyHtml = require('gulp-minify-html');
var htmlmin = require('gulp-htmlmin');
var minifyCss = require('gulp-minify-css');
var useref = require('gulp-useref');
var vulcanize = require('gulp-vulcanize');
var changed = require('gulp-changed');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
//var polylint = require('gulp-polylint');

var buildProps = null;

var AUTOPREFIXER_BROWSERS = [
	'ie >= 10',
	'ie_mob >= 10',
	'ff >= 30',
	'chrome >= 34',
	'safari >= 7',
	'opera >= 23',
	'ios >= 7',
	'android >= 44',
	'bb >= 10'
];

var src = '.';
var DIST = '.';
var dist = function(subpath) {
	return !subpath ? DIST : path.join(DIST, subpath);
};

/** True if any errors have been sent to handleError() */
let haveErrors = false;
/** Set to true to fail as soon as an error is handled by handleError instead of just toggling the haveErrors flag. **/
let hardFail = false;
/**
 *  Standard error handler, for use with the plumber plugin or on() function.
 */
function handleError(error) {
	if (hardFail) {
		const errorMessage = error ? ': ' + error.message : '';
		util.log('Error(s) found (ending current task)', errorMessage);
		if (this && this.emit) {
			this.emit('end'); //End function
		}
		process.exit(1);
	} else {
		haveErrors = true;
	}
}

/** Configures proxy for use with BrowserSync. The getBuildProperties task must be called first. */
function getProxies() {
	var apiHost = buildProps.apiHost;
	var apiProxyOptions;
	var namesProxyOptions;
	var domCfgProxyOptions;
	if (apiHost) {
		apiProxyOptions = url.parse('http://' + apiHost + '/api');
		apiProxyOptions.route = '/api';
		apiProxyOptions.cookieRewrite = apiHost;

		namesProxyOptions = url.parse('http://' + apiHost + '/names.nsf');
		namesProxyOptions.route = '/names.nsf';
		namesProxyOptions.cookieRewrite = apiHost;

		domCfgProxyOptions = url.parse('http://' + apiHost + '/domcfg.nsf');
		domCfgProxyOptions.route = '/domcfg.nsf';
		domCfgProxyOptions.cookieRewrite = apiHost;

		return [proxy(apiProxyOptions), proxy(domCfgProxyOptions),
			proxy(namesProxyOptions), historyApiFallback()
		];
	}
}

// Get the properties
gulp.task('getBuildProperties', function(callback) {
	props.parse('build.properties', {path: true}, function(err, obj) {
		buildProps = obj;
		util.log(util.colors.magenta('build.properties loaded!'));
		callback(err);
	});
});

/** Handles TypeScript errors; this version decorates the gulp-typescript LongReporter and adds error tracking. */
function typeScriptReporter() {
	const longReporter = ts.reporter.longReporter();
	return {
		error: function(error) {
			longReporter.error(error);
			handleError(error);
		},
		finish: function(results) {
			longReporter.finish(results);
			if (haveErrors) {
				hardFail = true;
				handleError();
			}
		}
	};
}

// TypeScript support
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
gulp.task('typescript', function() {
	const tsResult = tsProject.src()
		.pipe(sourcemaps.init())
		.pipe(plumber({errorHandler: handleError}))
		.pipe(tsProject(typeScriptReporter()));
	return merge([
		tsResult.dts.pipe(gulpIgnore.exclude(src + '/test/**/*')).pipe(gulp.dest(dist())),
		tsResult.js.pipe(sourcemaps.write(src)).pipe(gulp.dest(src))
	]);
});

// gulp.task('polylint', function() {
// 	return gulp.src([src + '/elements/**/*.html', '!' + src + '/elements/elements.html'])
// 		.pipe(plumber({errorHandler: handleError}))
// 		.pipe(polylint())
// 		.pipe(polylint.reporter(polylint.reporter.stylishlike))
// 		.pipe(polylint.reporter.fail({ buffer: true, ignoreWarnings: false }));
// });

// Clean output directory
gulp.task('clean', function() {
	var filesToDelete = ['.tmp', src + '/{test,demo}/**/*.{js,map,d.ts}', src + '/*.{js,map,d.ts}', '!' + src + '/{gulpfile,wct.conf}.js'];
	if (dist() != '.') {
		filesToDelete.push(dist());
	}
	return del(filesToDelete);
});

// Watch files for changes & reload
gulp.task('serve', ['typescript', 'getBuildProperties'], function() {

	browserSync({
		port: 5000,
		notify: false,
		logPrefix: 'PSK',
		// logLevel: 'debug',
		logConnections: true,
		snippetOptions: {
			rule: {
				match: '<span id="browser-sync-binding"></span>',
				fn: function(snippet) {
					return snippet;
				}
			}
		},
		// Run as an https by uncommenting 'https: true'
		// Note: this uses an unsigned certificate which on first access
		//       will present a certificate warning in the browser.
		// https: true,
		server: {
			baseDir: ['.tmp', '.'],
			routes: {
				'/': 'bower_components/'
			},
			index: 'index.html',
			directory: true,
			middleware: getProxies()
		}
	});

	// gulp.watch(['*.html'], reload);
	gulp.watch([
			'{' + src + ',demo,test}/**/*.{ts,html}',
			'!{' + src + ',demo,test}/**/*.d.ts'
		],
		['typescript', reload]);
	gulp.watch([src + '/styles/**/*.css'], reload);
	gulp.watch([src + '/images/**/*'], reload);
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
	runSequence(
		['typescript'],
		// ['copy', 'styles'],
		// ['images', 'fonts'],
		cb);
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `gulp-tasks` directory
try {
	require('require-dir')('gulp-tasks');
} catch (err) {
	// Do nothing
}
