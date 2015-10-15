/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!ui-library-custom', [ 'plugin!ui-library' ], function( UiLibrary ) {
	class UiLibraryCustom extends UiLibrary {
		constructor( editor ) {
			super( editor );
		}
	}

	return UiLibraryCustom;
} );