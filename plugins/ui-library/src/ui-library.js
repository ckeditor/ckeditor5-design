/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * UI Library Plugin.
 *
 * @class UiLibrary
 * @extends Plugin
 */

CKEDITOR.define( 'plugin!ui-library', [ 'plugin' ], function( Plugin ) {
	class UiLibrary extends Plugin {
		constructor( editor ) {
			super( editor );
		}
	}

	return UiLibrary;
} );