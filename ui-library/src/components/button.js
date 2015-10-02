/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ '../../../core/src/ui/view' ], function( View ) {
	class Button extends View {
		/**
		 * Creates an instance of the {@link Button} class.
		 *
		 * @param {Model} mode (View)Model of this Button.
		 * @constructor
		 */
		constructor( model ) {
			super( model );

			/**
			 * The template of this button.
			 */
			this.template = '<input class="ck-button" type="button" value="" />';

			// Bind model's "value" property to the DOM "value" attribute.
			this.bindModel( 'value',
				v => this.el.setAttribute( 'value', v ) );

			// Bind model's "disabled" property to the DOM "disabled" attribute.
			this.bindModel( 'disabled',
				d => this.el[ ( d ? 'set' : 'remove' ) + 'Attribute' ]( 'disabled', 'disabled' ) );
		};
	}

	return Button;
} );
