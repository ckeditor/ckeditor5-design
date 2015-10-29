/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'plugin!creator-classic', [
	'creator',
	'plugin!creator-classic/controller'
], function( Creator, ClassicCreatorController ) {
	class ClassicCreatorPlugin extends Creator {
		constructor( editor ) {
			super( editor );
		}

		create() {
			this.controller = new ClassicCreatorController( {
				editor: this.editor
			} );

			return this.controller.init();
		}

		destroy() {
			this.controller.destroy();
		}
	}

	return ClassicCreatorPlugin;
} );