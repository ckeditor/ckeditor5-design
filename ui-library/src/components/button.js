/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ '../../../core/src/ui/view' ], function( View ) {
	class Button extends View {
		constructor( model ) {
			super( model );

			this.el = document.createElement( 'input' );
			this.el.attributes.type = 'button';

		};
	}

	return Button;
} );
