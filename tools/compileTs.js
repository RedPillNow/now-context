/**
 * This file was stolen from https://github.com/Microsoft/TypeScript/issues/6387
 */
'use strict';

const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const process = require('process');
const chalk = require('./chalkConfig');

function reportDiagnostics(diagnostics) {
	diagnostics.forEach(diagnostic => {
		let message = 'Error';
		if (diagnostic.file) {
			const where = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			message += ' ' + diagnostic.file.fileName + ' ' + where.line + ', ' + where.character + 1;
		}
		message += ': ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		console.log(chalk.error(message));
	});
}

function readConfigFile(configFileName) {
	// Read config file
	const configFileText = fs.readFileSync(configFileName).toString();

	// Parse JSON, after removing comments. Just fancier JSON.parse
	const result = ts.parseConfigFileTextToJson(configFileName, configFileText);
	const configObject = result.config;
	if (!configObject) {
		reportDiagnostics([result.error]);
		process.exit(1);
	}

	// Extract config infromation
	const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));
	if (configParseResult.errors.length > 0) {
		reportDiagnostics(configParseResult.errors);
		process.exit(1);
	}
	return configParseResult;
}

module.exports.compile = function compile(configFileName) {
	console.log(chalk.processing('Compiling TypeScript...'));
	// Extract configuration from config file
	const config = readConfigFile(configFileName);

	// Compile
	const program = ts.createProgram(config.fileNames, config.options);
	const emitResult = program.emit();

	// Report errors
	let diags = ts.getPreEmitDiagnostics(program);
	reportDiagnostics(diags);
	// Return code
	const exitCode = emitResult.emitSkipped ? 1 : 0;
	// process.exit(exitCode);
	if (exitCode === 1) {
		console.log(chalk.warning('Encountered ' + diags.length + ' errors. No files were emitted!'));
	} else {
		let jsFiles = emitResult.emittedFiles ? emitResult.emittedFiles.length : 0;
		let maps = emitResult.sourceMaps ? emitResult.sourceMaps.length : 0;
		console.log(chalk.success('Done compiling TypeScript:\n' +
			'.js files emitted: ' + jsFiles + '\n' +
			'source maps emitted: ' + maps));
	}
};
