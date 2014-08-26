/**
 * Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * See LICENSE.md for license information.
 */

'use strict';

module.exports = function( grunt ) {
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		jshint: {
			files: [ '*.js' ],
			options: jshintConfig
		},

		jscs: {
			src: '*.js',
			options: jscsConfig
		},

		githooks: {
			all: {
				'pre-commit': 'default'
			}
		},

		build: {
			options: {
				beautify: false
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-githooks' );

	// Custom tasks.
	grunt.registerTask( 'build', 'Generates a build.', build );

	// Default tasks.
	grunt.registerTask( 'default', [ 'jshint', 'jscs' ] );
};

function build() {
	var requirejs = require( 'requirejs' ),
		fs = require('fs' ),
		options = this.options();

	var config = {
		baseUrl: 'src/',
		name: 'ckeditor',
		out: 'build/ckeditor.js',
		optimize: 'none'	// Do not minify because of AMDClean.
	};

	// Make grunt wait because requirejs.optimize is a async method.
	var done = this.async();

	requirejs.optimize( config,
		function ( buildResponse ) {
			try {
				var code =
					// CKEditor bootstrap code.
					preProcess( fs.readFileSync( 'ckeditor.js', 'utf8' ) ) + '\n' +

					// CKEditor code.
					fs.readFileSync( config.out, 'utf8' ) + '\n';

				// AMDClean, to remove define/require from the code.
				var amdclean = require('amdclean');
				code = amdclean.clean( code );

				// Finally, minify the whole code.
				code = minify( code );

				// Add copyright notices.
				code =
					'/*\n' +
					' Copyright (c) 2003-' + ( new Date() ).getFullYear() + ', CKSource - Frederico Knabben. All rights reserved.\n' +
					' For licensing, see LICENSE.md or http://ckeditor.com/license\n' +
					'*/\n\n' +
					code;

				// Overwrite the output file with the new code.
				fs.writeFileSync( config.out, code );
			} catch( e ) {
				console.log( e );
			}
			done();

		},
		function( err ) {
			console.log( err );
			done( false );
		}
	);

	function preProcess( code ) {
		code = code.replace( /[^\n]*\%REMOVE_LINE%[^\n]*\n?/g, '' );
		return code;
	}

	function minify( code ) {
		var uglifyJS = require("uglify-js");

		var toplevel = uglifyJS.parse( code );
		toplevel.figure_out_scope();

		var compressor = uglifyJS.Compressor();
		var compressed_ast = toplevel.transform(compressor);

		compressed_ast.figure_out_scope();
		compressed_ast.compute_char_frequency();
		compressed_ast.mangle_names();

		return compressed_ast.print_to_string( {
			beautify: !!options.beautify,
			max_line_len: 1000
		} );
	}
}

// Configurations for JSHint
var jshintConfig = {
};

// Configurations for JSCS (JavaScript Code Style checker)
var jscsConfig = {
	'excludeFiles': [
		'node_modules/*'
	],
	'requireCurlyBraces': [
		'if', 'else', 'for', 'while', 'do', 'switch', 'try', 'catch'
	],
	'requireSpaceAfterKeywords': [
		'if', 'else', 'for', 'while', 'do', 'switch', 'return', 'try', 'catch'
	],
	'requireSpaceBeforeBlockStatements': true,
	'requireParenthesesAroundIIFE': true,
	'requireSpacesInConditionalExpression': {
		'afterTest': true,
		'beforeConsequent': true,
		'afterConsequent': true,
		'beforeAlternate': true
	},
	'requireSpacesInFunctionExpression': {
		'beforeOpeningCurlyBrace': true
	},
	'disallowSpacesInFunctionExpression': {
		'beforeOpeningRoundBrace': true
	},
	'requireBlocksOnNewline': true,
	'requireSpacesInsideObjectBrackets': 'all',
	'requireSpacesInsideArrayBrackets': 'all',
	'disallowSpaceAfterObjectKeys': true,
	'requireCommaBeforeLineBreak': true,
	'requireOperatorBeforeLineBreak': [
		'?', '=', '+', '-', '/', '*', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=',
		'-=', '/=', '^='
	],
	'requireSpaceBeforeBinaryOperators': [
		'+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=', '-=',
		'/=', '^='
	],
	'requireSpaceAfterBinaryOperators': [
		'+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=', '-=',
		'/=', '^='
	],
	'disallowSpaceAfterPrefixUnaryOperators': [
		'++', '--', '+', '-', '~', '!'
	],
	'disallowSpaceBeforePostfixUnaryOperators': [
		'++', '--'
	],
	'disallowKeywords': [
		'with'
	],
	'validateLineBreaks': 'LF',
	'validateQuoteMarks': {
		'mark': '\'',
		'escape': true
	},
	'validateIndentation': '\t',
	'disallowMixedSpacesAndTabs': true,
	'disallowTrailingWhitespace': true,
	'disallowKeywordsOnNewLine': [
		'else', 'catch'
	],
	'maximumLineLength': 120,
	'safeContextKeyword': [
		'that'
	],
	'requireDotNotation': true,
	'disallowYodaConditions': true
};
