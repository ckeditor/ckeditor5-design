/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!toolbar/editortoolbar', [ 'plugin!ui-library/toolbar', 'ui/region' ], function( Toolbar, Region ) {
	/**
	 * Creates an instance of the {@link AppChrome} class.
	 *
	 * @param {Model} mode (View)Model of this AppChrome.
	 * @constructor
	 */
	class EditorToolbar extends Toolbar {
		constructor( model ) {
			super( model );

			/**
			 * The template of this EditorToolbar.
			 */
			this.template.attributes.class.push( 'ck-editortoolbar' );

			this.regions.add( new Region( 'toolbar', this.el ) );
		}
	}

	return EditorToolbar;
} );