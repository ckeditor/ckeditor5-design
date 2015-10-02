/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'Collection', 'Model' ], function( Collection, Model ) {
	class View extends Model {
		/**
		 * Creates an instance of the {@link View} class.
		 *
		 * @param {Model} mode (View)Model of this View.
		 * @constructor
		 */
		constructor( model ) {
			super();

			/**
			 * Model of this view.
			 */
			this.model = new Model( model );

			/**
			 * Regions which belong to this view.
			 */
			this.regions = new Collection();

			this.regions.on( 'add', ( evt, region ) => this.el.appendChild( region.el ) );
		};

		/**
		 * Element of this view.
		 *
		 * @property el
		 */
		get el() {
			if ( this._el ) {
				return this._el;
			}

			var el = document.createElement( 'div' );
			el.innerHTML = this.template;
			return this._el = el.firstChild;
		};

		/**
		 * Binds a property of the model to a specific listener that
		 * updates the view when the property changes.
		 *
		 * @param {String} name Property name in the model.
		 * @param {Function} listener A listener bound the model's property.
		 * @constructor
		 */
		bindModel( name, listener ) {
			// Execute listener when the property changes.
			this.model.on( 'change:' + name, ( evt, value ) => listener( value ) );

			// Set the initial state of the view.
			listener( this.model[ name ] );
		};

		destroy() {};
	}

	return View;
} );
