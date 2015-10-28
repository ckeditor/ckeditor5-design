/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!ui-library-custom/button/view', [
	'plugin!ui-library/button/view'
], function( ButtonView ) {
	class CustomButtonView extends ButtonView {
		/**
		 * Creates an instance of the {@link CustomButtonView} class.
		 *
		 * @param {Model} mode (View)Model of this CustomButtonView.
		 * @constructor
		 */
		constructor( model ) {
			super( model );

			this.template.attrs.class = this.bind(
				'state',
				( el, value ) => 'ck-button ck-button-custom ' + 'ck-button-' + value
			);
		}
	}

	return CustomButtonView;
} );
