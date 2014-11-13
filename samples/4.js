require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var firstPattern = /(\s|^)(\w)/g;

	var Input = mvc.View.extend( {
		template: [
			'div', [
				[ 'input', {
					oninput: mvc.View.bindAttr( 'value', 'model.text', 'model.trim' ),
					value: mvc.View.bindProp( 'model.text' )
				} ],
				[ 'button', {
					onclick: 'model.clear',
					text: 'Clear'
				} ]
			]
		]
	} );

	var Label = mvc.View.extend( {
		template: [ 'p', mvc.View.bindProp( 'model.text', 'model.capitalize' ) ]
	} );

	var model = new mvc.Model( {
		text: 'foo'
	}, {
		capitalize: function( text ) {
			return text.replace( firstPattern, function( m, a, b ) {
				return a + b.toUpperCase();
			} );
		},
		clear: function() {
			this.text = '';
		},
		trim: function( text ) {
			return text.trim();
		}
	} );

	var input = new Input( {
		model: model
	} );

	input.render();
	document.body.appendChild( input.el );

	var label = new Label( {
		model: model
	} );

	label.render();
	document.body.appendChild( label.el );
} );