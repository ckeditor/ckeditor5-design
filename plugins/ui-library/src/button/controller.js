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
			super( model );

			this.view = new ButtonView( this._createViewModel() );

			this.view.on( 'click', () => {
				this.model.fire( 'exec' );
				this.view.model.count += 1;
			} );

			this.type = { button: 1 };
		}

		_createViewModel() {
			let viewModel = new Model( {
				count: 0
			} );

			viewModel.bind( 'state', 'disabled', 'label' ).with( this.model );

			return viewModel;
		}
	}

	return ButtonController;
} );
