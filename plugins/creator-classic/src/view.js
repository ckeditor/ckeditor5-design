/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic/view', [
	'ui/view',
	'ui/region'
], function( View, Region ) {
	class ClassicCreatorView extends View {
		constructor( model ) {
			super( model );

			this.regions.add( new Region( 'chrome' ) );

			this.element = this.model.editor.element;
		}

		init() {
			this.element.style.display = 'none';
		}

		destroy() {
			this.element.style.display = '';

			super.destroy();
		}
	}

	return ClassicCreatorView;
} );