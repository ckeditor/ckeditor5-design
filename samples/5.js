require.config( {
	baseUrl: '../src/'
} );

require( [ 'core/mvc' ], function( mvc ) {
	var Button = mvc.View.extend( {
		template: [
			'button', {
				onclick: 'click',
				className: mvc.View.bindProp( 'model.active', 'getActiveClass' ),
				text: mvc.View.bindProp( 'model.text' )
			}
		],

		click: function() {
			this.model.counter++;
			this.model.active = !this.model.active;
		},

		getActiveClass: function( value ) {
			return value ? 'active' : '';
		}
	} );

	var LinkButton = Button.extend( {
		template: [
			'a', {
				className: Button.bindProp( 'model.active', 'getActiveClass' ),
				onclick: 'click',
				href: 'javascript:;',
				children: [
					[ 'span', {
						className: 'icon'
					} ],
					[ 'span', Button.bindProp( 'model.text' ) ]
				]
			}
		]
	} );

	var model = window.model = new mvc.Model( {
		active: false,
		counter: 0,
		text: 'Foo'
	} );

	model.on( 'change:counter', function( model, value ) {
		console.log( 'Counter changed:', value );
	} );

	var button = new Button( model );

	document.body.appendChild( button.render().el );

	var linkButton = new LinkButton( model );

	document.body.appendChild( linkButton.render().el );

	var iconLinkButton = new IconLinkButton( model );

	document.body.appendChild( iconLinkButton.render().el );
} );