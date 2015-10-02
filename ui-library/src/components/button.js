/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ '../../../core/src/ui/view' ], function( View ) {
	class Button extends View {
		constructor( model ) {
			super( model );

			this.template = '<input class="ck-button" type="button" value="" />';

			this.bindModel( 'value',
				v => this.el.setAttribute( 'value', v ) );
			this.bindModel( 'disabled',
				d => this.el[ ( d ? 'set' : 'remove' ) + 'Attribute' ]( 'disabled', 'disabled' ) );
		};
	}

	return Button;
} );
