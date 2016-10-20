/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );
const jsdoc = require( 'gulp-jsdoc3' );

class Reporter {
	// TODO
}

/**
 * @param {Object} config
 * @returns {Promise}
 */
function buildDocs( { src, out } ) {
	const config = {
		opts: {
			encoding: 'utf8',
			recurse: true,
			access: 'all',
			template: 'node_modules/ink-docstrap/template',
			destination: out,
		},
		source: {
			includePattern: '.+\\.js(doc)?$',
			excludePattern: '/lib/'
		},
		plugins: [
			'node_modules/jsdoc/plugins/markdown',
			'jsdoc/plugins/export-fix',
			'jsdoc/plugins/longname-fix/longname-fix',
			'jsdoc/plugins/linter/linter'
		],
		tags: {
			allowUnknownTags: true,
			dictionaries: [ 'jsdoc', 'closure' ]
		},
		templates: {
			monospaceLinks: true,
			cleverLinks: true
		},

		reporter: new Reporter(),
	};

	return new Promise( ( resolve ) => {
		gulp.src( src, { read: false } )
			.pipe( jsdoc( config, resolve ) );
	} );
}

module.exports = buildDocs;
