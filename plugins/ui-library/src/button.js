/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'ui/view' ], function( View ) {
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
			this.template = {
				tag: 'input',
				attributes: {
					'class': [ 'ck-button' ],
					type: 'button',
					value: this.bind( this.model, 'value' ),
					disabled: this.bind( this.model, 'disabled', ( el, value ) =>
						el[ ( value ? 'set' : 'remove' ) + 'Attribute' ]( 'disabled', 'disabled' ) )
				}
			};
		}
	}

	return Button;
} );
