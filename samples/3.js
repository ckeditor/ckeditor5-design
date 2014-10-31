require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var Button = mvc.View.extend( {
		template: [
			'button', {
				onclick: 'click',
				textContent: mvc.View.bindProp( 'model.text' )
			}
		],

		click: function() {
			this.model.counter++;
		}
	} );

	var model = window.model = new mvc.Model( {
		counter: 0,
		text: 'Foo'
	} );

	model.on( 'change:counter', function( model, value ) {
		console.log( 'Counter changed:', value );
	} );

	var button = new Button( {
		model: model
	} );

	button.render();

	document.body.appendChild( button.el );
} );