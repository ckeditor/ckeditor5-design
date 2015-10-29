/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!toolbar/editortoolbar/controller', [
	'model',
	'ui/controller',
	'plugin!toolbar/editortoolbar/view',
	'plugin!ui-library/button/controller'
], function( Model, Controller, EditorToolbarView, ButtonController ) {
	class EditorToolbarController extends Controller {
		/**
		 * @constructor
		 */
		constructor( model ) {
			super( model );

			this.view = new EditorToolbarView();
		}

		init() {
			return super.init()
				.then( this.injectButtons.bind( this ) );
		}

		createButton( label ) {
			var model = new Model( {
				label: label,
				state: 'off',
				count: 0
			} );

			return new ButtonController( model );
		}

		injectButtons() {
			return Promise.all( this.model.items.filter( i => {
				return this.append( this.createButton( i ), 'container' );
			} ) );
		}
	}

	return EditorToolbarController;
} );
