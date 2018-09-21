'use strict';
const url = require('url');
const browserSync = require('browser-sync');
const proxy = require('proxy-middleware');
const historyApiFallback = require('connect-history-api-fallback');
const compress = require('compression');
const serverOptions = require('./serverOptions');
const compiler = require('./compileTs');

let middlewareOptions = [];

function initProxies() {
	let protocol = serverOptions.protocol + '://';
	let proxyPaths = serverOptions.proxyPaths;
	for (let i = 0; i < proxyPaths.length; i++) {
		let path = proxyPaths[i];
		let options = url.parse(protocol + serverOptions.hostname + path);
		options.route = path;
		options.cookieRewrite = serverOptions.hostname;
		middlewareOptions.push(proxy(options));
	}
	middlewareOptions.push(historyApiFallback());
}

let dir = process.argv[2] ? process.argv[2] : 'demo';
let logPrefix = 'now-context:' + dir.toUpperCase();
let filesProp = null;
let serverProp = {
	baseDir: ['.tmp', dir],
	middleware: middlewareOptions
};
serverProp.index = dir + '/index.html';
if (dir === 'dist') {
	let namespace = serverOptions.namespace;
	serverProp.baseDir = ['.tmp', dir, dir + '/' + namespace];
	serverProp.index = namespace + '/index.html';
	serverProp.middleware.push(compress());
	filesProp = [
		'./dist/**/*.html',
		'./dist/**/*.json',
		{
			match: ['./dist/**/*.*'],
			fn: (evt, file) => {
				browserSync.reload();
			}
		}
	];
} else {
	serverProp.baseDir = ['.tmp', './'];
	filesProp = [
		'./**/*.html',
		'./**/*.json',
		{
			match: ['./**/*.ts', '!./**/*.d.ts'],
			fn: (evt, file) => {
				compiler.compile('tsconfig.json');
				browserSync.reload();
			}
		}
	];
}

initProxies();
browserSync({
	port: serverOptions.port,
	notify: false,
	logPrefix: logPrefix,
	snippetOptions: {
		rule: {
			match: '<span id="browser-sync-binding"></span>',
			fn: function(snippet) {
				return snippet;
			}
		}
	},
	https: serverOptions.protocol === 'https' ? true : false,
	server: serverProp,
	files: filesProp
});
