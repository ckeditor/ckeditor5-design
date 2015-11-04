/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout */

'use strict';

/**
 * Basic Italic Plugin.
 *
 * @class Italic
 * @extends Plugin
 */

CKEDITOR.define( 'plugin!italic', [
	'model',
	'collection',
	'feature',
	'plugin!ui-library/button/controller',
], function( Model, Collection, Feature, ButtonController ) {
	class Italic extends Feature {
		constructor( editor ) {
			super( editor );

			this.set( 'label', 'Italic' );
			this.on( 'exec', this.exec.bind( this ) );
			// editor.onStyleStateChange( value => this.state = value );
		}

		init() {
			this.editor.uiItems.add( new ButtonController( this ) );

			this.editor.features.add( this );
		}

		exec() {
			// this.on ? editor.removeStyle() : editor.applyStyle();
			// -> modifies the data model
			// -> it executes editor.onStyleStateChange
			// that changes the state

			setTimeout( () => {
				this.state = !this.state;
			}, 500 );
		}
	}

	return Italic;
} );