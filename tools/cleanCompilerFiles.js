'use strict';

const chalk = require('./chalkConfig');
const fs = require('fs');
const path = require('path');

let options = {
	ignore: ['bower_components', 'tools', 'node_modules'],
	pattern: ['.js', '.map'],
	test: false
};
let processedFiles = [];
let srcDir = process.argv[2] || './';
findFiles(srcDir, options);

/**
 * Create a list of files to delete based on the options passed
 *
 * @param {any} startPath
 * @param {any} opts
 * @property {string | string[]} opts.ignore - directory(ies) to ignore
 * @property {string | string[]} opts.pattern - File extensions to find
 * @property {boolean} opts.test - Do a dry run
 * @returns {string[]}
 */
function findFilesInDir(startPath, opts) {
	let results = [];
	fs.readdirSync(startPath).forEach((item, idx, files) => {
		let relPath = path.resolve(startPath, item);
		processedFiles.push(relPath);
		if (!isIgnored(relPath, options.ignore)) {
			let stat = fs.statSync(relPath);
			if (stat.isDirectory()) {
				results = results.concat(findFilesInDir(relPath, options));
			}

			if (stat.isFile() && matchesPatterns(relPath, options.pattern)) {
				results.push(relPath);
			}
		}
	});
	return results;
};

function isIgnored(file, ignore) {
	let ignored = false;
	let pathArr = file.split(path.sep);
	for (let i = 0; i < pathArr.length; i++) {
		let part = pathArr[i];
		if (ignore.indexOf(part) > -1) {
			ignored = true;
			break;
		}
	}
	return ignored;
}

function matchesPatterns(file, pattern) {
	let ext = path.extname(file);
	if (pattern.indexOf(ext) > -1) {
		return true;
	}
	return false;
}

function setupOptions(opts) {
	options = opts ? opts : options;
	if (!options.test) {
		options.test = false;
	}
	if (!options.pattern) {
		options.pattern = ['.js', '.map'];
	}
	if (!options.ignore || !Array.isArray(options.ignore)) {
		if (options.ignore && !Array.isArray(options.ignore)) {
			options.ignore = [options.ignore];
		} else if (!options.ignore) {
			options.ignore = ['bower_components'];
		}
	}
}

/**
 * Create a list of files to delete based on the options passed
 *
 * @param {any} srcDir
 * @param {any} opts
 * @property {string | string[]} opts.ignore - directory(ies) to ignore
 * @property {string | string[]} opts.pattern - File extensions to find
 * @property {boolean} opts.test - Do a dry run
 * @returns {any} returnObj
 * @property {string[]} returnObj.processed
 * @property {string[]} returnObj.deleted
 */
function findFiles(src, opts) {
	src = src || srcDir;
	if (!fs.existsSync(src)) {
		console.log(chalk.error(src + ' does not exist!'));
		return;
	}

	setupOptions(opts);
	let announce = options.test ? 'Testing ' : '';
	announce += 'Recursively Deleting all .js and .map files in the ';
	announce += src + ' directory...';
	console.log(chalk.processing(announce));
	if (!Array.isArray(options.pattern)) {
		options.pattern = [options.pattern];
	}
	let files = findFilesInDir(src, options);
	let deletedFiles = [];
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		deletedFiles.push(file);
		if (!options.test) {
			fs.unlinkSync(file);
		}
	}
	let message = 'Processed:' + processedFiles.length + ' items\n';
	message += options.test ? 'Would have Deleted: ' : 'Deleted: ';
	message += deletedFiles.length + ' files';
	if (options.test) {
		console.log(chalk.success(message + '\n'), deletedFiles);
	}else {
		console.log(chalk.success(message));
	}
	return {
		processed: processedFiles,
		deleted: deletedFiles
	};
};

module.exports.findFiles;
