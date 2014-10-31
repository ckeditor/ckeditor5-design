require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var Button = mvc.View.extend( {
		template: [
			'button', {
				onclick: 'click',
				textContent: mvc.View.bindProp( 'text' )
			}
		],

		click: function() {
			console.log( 'Button clicked!' );
		},

		initialize: function( options ) {
			this.text = options.text;
		}
	} );

	var button = window.button = new Button( {
		text: 'Button'
	} );

	button.render();

	document.body.appendChild( button.el );
} );