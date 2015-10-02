/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ './chrome' ], function( Chrome ) {
	/**
	 * Creates an instance of the {@link AppChrome} class.
	 *
	 * @param {Model} mode (View)Model of this AppChrome.
	 * @constructor
	 */
	class AppChrome extends Chrome {
		constructor( model ) {
			super( model );

			/**
			 * The template of this button.
			 */
			this.template = '<div class="ck-chrome ck-app-chrome"></div>';
		};
	}

	return AppChrome;
} );
