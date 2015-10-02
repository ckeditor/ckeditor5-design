/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'Collection', 'Model' ], function( Collection, Model ) {
	class Region extends Model {
		constructor( name, el ) {
			super();

			// Regions are named.
			this.name = name;

			// Regions may be virtual, to keep multiple views together
			// as a (somehow connected) group.
			if ( !el ) {
				el = document.createElement( 'div' );
				el.className = 'ck-region';
			}

			this.set( 'el', el );

			// Regions collect views.
			this.views = new Collection();

			this.views.on( 'add', ( evt, model ) => this.addView( model ) );
		};

		destroy() {
			// for each view in this.views
			// 	destroy the view
		};

		addView( view ) {
			this.el.appendChild( view.el );
		}
	}

	return Region;
} );
