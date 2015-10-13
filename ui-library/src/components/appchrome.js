/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'cmpt!appchrome', [ 'cmpt!chrome' ], function( Chrome ) {
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
			 * The template of this AppChrome.
			 */
			this.template.attributes.class.push( 'ck-app-chrome' );
		}
	}

	return AppChrome;
} );