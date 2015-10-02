/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'./components/Button'
], function( Button ) {
	class UiLibrary {
		constructor() {
			this.components = {
				button: Button
			}
		};
	}

	return UiLibrary;
} );
