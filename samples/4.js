require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var firstPattern = /(\s|^)(\w)/g,
		attr = mvc.View.bindAttr,
		prop = mvc.View.bindProp;

	var Input = mvc.View.extend( {
		template: [
			'div', [
				[ 'input', {
					oninput: attr( 'value', 'model.text', 'model.trim' ),
					value: prop( 'model.text' )
				} ],
				[ 'button', {
					onclick: 'model.clear',
					text: 'Clear'
				} ]
			]
		]
	} );

	var Label = mvc.View.extend( {
		template: [ 'p', prop( 'model.text', 'model.capitalize' ) ]
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

	document.body.appendChild( input.render().el );

	var label = new Label( {
		model: model
	} );

	document.body.appendChild( label.render().el );
} );