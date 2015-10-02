/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'./components/AppChrome',
	'./components/Button'
], function( AppChrome, Button ) {
	class UiLibrary {
		/**
		 * Creates an instance of the {@link UiLibrary} class.
		 *
		 * @constructor
		 */
		constructor() {
			/**
			 * Components registered in this {@link UiLibrary}.
			 */
			this.components = {
				AppChrome: AppChrome,
				Button: Button
			}
		};
	}

	return UiLibrary;
} );
