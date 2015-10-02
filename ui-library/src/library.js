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
		constructor() {
			this.components = {
				AppChrome: AppChrome,
				Button: Button
			}
		};
	}

	return UiLibrary;
} );
