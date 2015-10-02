/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'Collection', 'Model' ], function( Collection, Model ) {
	class View extends Model {
		constructor( model ) {
			super();

			// View observes a plain model object and reacts to model changes.
			this.model = new Model( model );

			// View may have a number of regions.
			this.regions = new Collection();
		};

		destroy() {
			// for each region in this.regions
			// 	destroy the region
		};
	}

	return View;
} );
