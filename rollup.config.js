/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: false, node: true, strict: true */

'use strict';

const nodeResolve = require( 'rollup-plugin-node-resolve' );

export default {
	entry: './entry-point.js',
	format: 'iife',

	dest: 'output-rollup.js',

	plugins: [
		nodeResolve()
	]
};
