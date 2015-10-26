/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!ui-library-custom/button', [ 'plugin!ui-library/button' ], function( Button ) {
	class CustomButton extends Button {
		/**
		 * Creates an instance of the {@link CustomButton} class.
		 *
		 * @param {Model} mode (View)Model of this CustomButton.
		 * @constructor
		 */
		constructor( model ) {
			super( model );

			this.template.attrs.class = this.bind( 'state',
				( el, value ) => 'ck-button ck-button-custom ' + 'ck-button-' + value );
		}
	}

	return CustomButton;
} );
