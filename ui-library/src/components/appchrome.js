/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ './chrome' ], function( Chrome ) {
	class AppChrome extends Chrome {
		constructor( model ) {
			super( model );

			this.template = '<div class="ck-chrome ck-app-chrome"></div>';
		};
	}

	return AppChrome;
} );
