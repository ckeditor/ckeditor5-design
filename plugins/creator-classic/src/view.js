/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic/view', [
	'ui/view'
], function( View ) {
	class ClassicCreatorView extends View {
		constructor( model ) {
			super( model );

			this.regionsDef = {
				chrome: true
			};

			this.el = document;
		}

		init() {
			super.init();

			this.model.editor.element.style.display = 'none';
		}

		destroy() {
			super.destroy();

			this.model.editor.element.style.display = '';
		}
	}

	return ClassicCreatorView;
} );