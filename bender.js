/* jshint browser: false, node: true */

'use strict';

// Set it to true to test with the build version.
var isBuild = false;

var config = {
	plugins: [
		// Uncomment to enable code coverage.
		// 'benderjs-coverage',

		'benderjs-mocha',
		'benderjs-chai',
		'benderjs-sinon',
		'benderjs-promise',
		'node_modules/ckeditor5/dev/bender/plugins/ckeditor5'
	],

	framework: 'mocha',

	applications: {
		'ckeditor5-design': {
			path: '.',
			files: [
				'node_modules/requirejs/require.js',
				'node_modules/ckeditor5/ckeditor.js'
			]
		}
	},

	tests: {
		all: {
			applications: [ 'ckeditor5-design' ],
			paths: [
				'core/tests/**',
				'ui-library/tests/**'
			]
		}
	}
};

module.exports = config;
