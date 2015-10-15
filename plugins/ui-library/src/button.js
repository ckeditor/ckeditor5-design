/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!ui-library/button', [ 'ui/view' ], function( View ) {
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
				tag: 'span',
				text: this.bindModel( 'count',
					( el, value ) => model.label + ' (' + value + ')' ),
				attributes: {
					'class': this.bindModel( 'state',
						( el, value ) => 'ck-button ' + 'ck-button-' + value )
				}
			};

			this.listeners.push(
				() => this.domListener( this.el, 'click', 'click' )
			);
		}
	}

	return Button;
} );