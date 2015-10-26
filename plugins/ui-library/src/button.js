/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * UI Library Button Component.
 *
 * @class Button
 * @extends View
 */

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
				text: this.bind( 'count',
					( el, value ) => model.label + ' (' + value + ')' ),
				attrs: {
					'class': this.bind( 'state',
						( el, value ) => 'ck-button ' + 'ck-button-' + value )
				},
				on: {
					click: 'click'
				}
			};
		}
	}

	return Button;
} );