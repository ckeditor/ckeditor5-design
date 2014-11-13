require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var firstPattern = /(\s|^)(\w)/g,
		attr = mvc.View.bindAttr,
		prop = mvc.View.bindProp;

	var Input = mvc.View.extend( {
		template: [ 'input', {
			oninput: attr( 'value', 'model.text', 'model.trim' ),
			value: prop( 'model.text' )
		} ]
	} );

	var Label = mvc.View.extend( {
		template: [ 'p', prop( 'model.text', 'capitalize' ) ],
		capitalize: function( text ) {
			return text.replace( firstPattern, function( m, a, b ) {
				return a + b.toUpperCase();
			} );
		}
	} );

	var Button = mvc.View.extend( {
		template: [ 'button', {
			onclick: 'model.clear',
			text: 'Clear'
		} ]
	} );

	var model = window.model = new mvc.Model( {
		text: 'foo'
	}, {
		clear: function() {
			this.text = '';
		},
		trim: function( text ) {
			return text.trim();
		}
	} );

	var input = window.input = new Input( {
		model: model
	} );

	document.body.appendChild( input.render().el );

	var button = window.button = new Button( {
		model: model
	} );

	document.body.appendChild( button.render().el );

	var label = window.label =new Label( {
		model: model
	} );

	document.body.appendChild( label.render().el );
} );