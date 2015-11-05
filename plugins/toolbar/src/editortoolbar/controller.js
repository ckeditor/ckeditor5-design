/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout, clearTimeout */

'use strict';

CKEDITOR.define( 'plugin!toolbar/editortoolbar/controller', [
	'model',
	'ui/controller',
	'plugin!toolbar/editortoolbar/view'
], function( Model, Controller, EditorToolbarView ) {
	class EditorToolbarController extends Controller {
		constructor( model ) {
			super( model, new EditorToolbarView() );
		}

		init() {
			var containerRegion = this.regions.get( 'container' );

			var shift = () => {
				// Simply shift UI items.
				containerRegion.add( containerRegion.remove( 0 ) );
				this.scrambleTimeout = setTimeout( shift, 1000 );
			};

			shift();
		}

		destroy() {
			clearTimeout( this.scrambleTimeout );
		}
	}

	return EditorToolbarController;
} );
