/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Basic Bold Plugin.
 *
 * @class Bold
 * @extends Plugin
 */

CKEDITOR.define( 'plugin!bold', [
	'model',
	'collection',
	'feature',
	'plugin!ui-library/button/controller',
], function( Model, Collection, Feature, ButtonController ) {
	class Bold extends Feature {
		constructor( editor ) {
			super( editor );

			this.set( 'label', 'Bold' );
			this.on( 'exec', this.exec.bind( this ) );
			// editor.onStyleStateChange( value => this.state = value );
		}

		init() {
			this.editor.uiItems.add( new ButtonController( this ) );

			this.editor.features.add( this );
		}

		exec() {
			// this.state ? editor.removeStyle() : editor.applyStyle();
			// -> modifies the data model
			// -> it executes editor.onStyleStateChange
			// that changes the state

			this.state = !this.state;
		}
	}

	return Bold;
} );