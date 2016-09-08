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
var ensureFiles = require('./gulp-tasks/ensure-files.js');
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

// TypeScript support
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
console.log(tsProject);
// generate .d.ts files
// tsProject.options.declaration = true;

var buildProps = null;

var AUTOPREFIXER_BROWSERS = [
	'ie >= 10',
	'ie_mob >= 10',
	'ff >= 30',
	'chrome >= 34',
	'safari >= 7',
	'opera >= 23',
	'ios >= 7',
	'android >= 4.4',
	'bb >= 10'
];

var DIST = '.';

var src = '.';

var dist = function(subpath) {
	return !subpath ? DIST : path.join(DIST, subpath);
};

/**
 *  Standard error handler, for use with the plumber plugin or on() function.
 */
function handleError(error) {
	console.log("Error (ending current task):", error.message);
	this.emit("end"); //End function
	process.exit(1);
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

var styleTask = function(stylesPath, srcs) {
	return gulp.src(srcs.map(function(src) {
		return path.join(src, stylesPath, src);
	}))
		.pipe(plumber({errorHandler: handleError}))
		.pipe(changed(stylesPath, {extension: '.css'}))
		.pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
		.pipe(gulp.dest('.tmp/' + stylesPath))
		.pipe(minifyCss())
		.pipe(gulp.dest(dist(stylesPath)))
		.pipe(size({title: stylesPath}));
};

var imageOptimizeTask = function(src, dest) {
	return gulp.src(src)
		.pipe(plumber({errorHandler: handleError}))
		.pipe(imagemin({
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest(dest))
		.pipe(size({title: 'images'}));
};

var optimizeHtmlTask = function(src, dest) {
	var assets = useref.assets({
		searchPath: ['.tmp', src]
	});

	return gulp.src(src)
		.pipe(plumber({errorHandler: handleError}))
		.pipe(assets)
		// Concatenate and minify JavaScript
		.pipe(gulpIf('*.js', uglify({
			preserveComments: 'some'
		})))
		// Concatenate and minify styles
		// In case you are still using useref build blocks
		.pipe(gulpIf('*.css', minifyCss()))
		.pipe(assets.restore())
		.pipe(useref())
		// Minify any HTML
		.pipe(gulpIf('*.html', minifyHtml({
			quotes: true,
			empty: true,
			spare: true
		})))
		// Output files
		.pipe(gulp.dest(dest))
		.pipe(size({
			title: 'html'
		}));
};

// Get the properties
gulp.task('getBuildProperties', function(callback) {
	props.parse('build.properties', {path: true}, function(err, obj) {
		buildProps = obj;
		util.log(util.colors.magenta('build.properties loaded!'));
		callback(err);
	});
});

gulp.task('typescript', function() {
	var destDir = src;

	var tsResult = gulp.src([
		src + '/**/*.ts',
		'!' + src + '/{node_modules,bower_components,dist,typings}/**/*'])
		.pipe(plumber({errorHandler: handleError}))
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject));

	return merge([
		tsResult.dts.pipe(gulpIgnore.exclude(src + '/test/**/*')).pipe(gulp.dest(dist())),
		tsResult.js.pipe(sourcemaps.write('.')).pipe(gulp.dest(destDir))
	]);
});

// gulp.task('polylint', function() {
// 	return gulp.src([src + '/elements/**/*.html', '!' + src + '/elements/elements.html'])
// 		.pipe(plumber({errorHandler: handleError}))
// 		.pipe(polylint())
// 		.pipe(polylint.reporter(polylint.reporter.stylishlike))
// 		.pipe(polylint.reporter.fail({ buffer: true, ignoreWarnings: false }));
// });

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
	return styleTask('styles', ['**/*.css']);
});

// Ensure that we are not missing required files for the project
// "dot" files are specifically tricky due to them being hidden on
// some systems.
gulp.task('ensureFiles', function(cb) {
	var requiredFiles = ['.bowerrc'];

	ensureFiles(requiredFiles.map(function(p) {
		return path.join(__dirname, p);
	}), cb);
});

// Optimize images
gulp.task('images', function() {
	return imageOptimizeTask(src + '/images/**/*', dist('images'));
});

// Copy all files at the root level (src) to the dist folder
gulp.task('copy', function() {
	return gulp.src([
		'README.md',
		'bower.json',
		'index.html',
		src + '/**',
		'!' + src + '/{bower_components,demo,test}{,/**}',
		'!**/.DS_Store'
	], {
		dot: true
	}).pipe(plumber({errorHandler: handleError})).pipe(gulp.dest(dist()));
});

// Replace local paths with ones that should work when installed via bower
gulp.task('replacePaths', function() {
	return gulp.src([dist() + "/*"]).
	pipe(plumber({errorHandler: handleError})).
	pipe(replace(src, '')).
	pipe(replace('bower_components', '..')).
	pipe(gulp.dest(dist()));
});

// Copy web fonts to dist
gulp.task('fonts', function() {
	return gulp.src([src + '/fonts/**'])
		.pipe(plumber({errorHandler: handleError}))
		.pipe(gulp.dest(dist('fonts')))
		.pipe(size({
			title: 'fonts'
		}));
});

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
	return optimizeHtmlTask(
		[src + '/**/*.html', '!' + src + '/{test,demo,bower_components}/**/*.html'],
		dist());
});

gulp.task("installTypings", function() {
	return gulp.src("./typings.json")
		.pipe(gulpTypings());
});

// Clean output directory
gulp.task('clean', function() {
	return del(['.tmp', dist(), src + '/{test,demo}/**/*.{js,map,d.ts}', src + '/*.{js,map,d.ts}', '!' + src + '/{gulpfile,wct.conf}.js']);
});

// Watch files for changes & reload
gulp.task('serve', ['styles', 'typescript', 'getBuildProperties'], function() {

	browserSync({
		port: 5000,
		notify: false,
		logPrefix: 'PSK',
		logLevel: 'debug',
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

	gulp.watch(['*.html'], [reload]);
	gulp.watch(['{' + src + ',demo,test}/**/*.{ts,html}'], ['typescript', reload]);
	gulp.watch([src + '/styles/**/*.css'], ['styles', reload]);
	gulp.watch([src + '/images/**/*'], reload);
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
	runSequence(
		['typescript'],
		// ['ensureFiles', 'copy', 'styles'],
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
