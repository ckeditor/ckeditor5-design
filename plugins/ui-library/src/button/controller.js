/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!ui-library/button/controller', [
	'model',
	'ui/controller',
	'plugin!ui-library/button/view',
], function( Model, Controller, ButtonView ) {
	class ButtonController extends Controller {
		/**
		 * @constructor
		 */
		constructor( model ) {
			// Passing Controller model straight as View model.
			// It is possible because Button is simple.
			super( model, new ButtonView( model ) );

			this.view.on( 'click', () => {
				this.model.state = ( this.model.state == 'off' ? 'on' : 'off' );
				this.model.count++;
			} );
		}
	}

	return ButtonController;
} );
