require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var Button = mvc.View.extend( {
		template: [
			'button', {
				onclick: 'click',
				textContent: mvc.View.bindProp( 'model.text', 'capitalize' )
			}
		],

		capitalize: function( value ) {
			return value && value.length ? value[ 0 ].toUpperCase() + value.substr( 1 ) : value;
		},

		click: function() {
			this.model.counter++;
		}
	} );

	var model = window.model = new mvc.Model( {
		counter: 0,
		text: 'foo'
	} );

	model.on( 'change:counter', function( model, value ) {
		console.log( 'Counter changed:', value );
	} );

	var button = window.button = new Button( {
		model: model
	} );

	button.render();

	document.body.appendChild( button.el );

	model.text = 'bar';
} );