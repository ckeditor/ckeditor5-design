/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout, clearTimeout */

'use strict';

CKEDITOR.define( 'plugin!toolbar/editortoolbar/controller', [
	'model',
	'collection',
	'ui/controller',
	'plugin!toolbar/editortoolbar/view'
], function( Model, Collection, Controller, EditorToolbarView ) {
	class EditorToolbarController extends Controller {
		constructor( model ) {
			super( model, new EditorToolbarView() );

			this.register( 'container', new Collection() );
		}

		init() {
			return super.init().then( () => {
				let shiftChildren = () => {
					this.addChild( 'container',
						this.removeChild(
							'container',
							this.getChild( 'container', 0 )
						)
					);
					this.scrambleTimeout = setTimeout( shiftChildren, 1000 );
				};

				shiftChildren();
			} );
		}

		destroy() {
			return super.destroy().then( () => {
				clearTimeout( this.scrambleTimeout );
			} );
		}
	}

	return EditorToolbarController;
} );
