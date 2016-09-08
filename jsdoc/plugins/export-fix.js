/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

module.exports = {
	handlers: {
		/**
		 * @see http://usejsdoc.org/about-plugins.html#event-beforeparse
		 * @param evt
		 */
		beforeParse( evt ) {
			// Fixes a.js.
			evt.source = evt.source.replace( /(\n\t*)export default class /, '$1class ' );

			// Fixes b.js.
			evt.source = evt.source.replace( /(\n\t*)export class /g, '$1class ' );

			// Fixes d.js.
			evt.source = evt.source.replace( /(\n\t*)export default function /, '$1export function ' );

			// console.log( evt.source );
		}
	}
};
