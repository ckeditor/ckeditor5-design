/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout */

'use strict';

/**
 * UI Library Framed Editable Component.
 *
 * @class FramedEditable
 * @extends View
 */

CKEDITOR.define( 'plugin!ui-library/framededitableview', [ 'ui/view' ], function( View ) {
	class FramedEditableView extends View {
		constructor( model ) {
			super( model );

			this.template = {
				tag: 'iframe',
				attrs: {
					'class': [ 'ck-framededitable' ],
					sandbox: 'allow-same-origin'
				}
			};
		}

		init() {
			return new Promise( resolve => {
				setTimeout( () => {
					this.el.contentDocument.body.contentEditable = true;
					resolve();
				}, 2000 );
			} );
		}
	}

	return FramedEditableView;
} );
