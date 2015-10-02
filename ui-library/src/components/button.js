/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ '../../../core/src/ui/view' ], function( View ) {
	class Button extends View {
		constructor( model ) {
			super();

			this.template = '<input class="ck-button" type="button" value="" />';

			this.listeners = {
				value: value => this.el.setAttribute( 'value', value ),
				disabled: disabled => this.el[ disabled ? 'setAttribute' : 'removeAttribute' ]( 'disabled', 1 )
			};

			this.model.on( 'change', function( evt, name, value ) {
				this.listeners[ name ] && this.listeners[ name ]( value );
			}, this );

			this.model.set( model );
		};
	}

	return Button;
} );
