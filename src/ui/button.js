define( [
	'ui',
	'core/mvc',
	'tools/dombuilder'
], function(
	ui,
	MVC,
	_
) {
	var Button = MVC.View.extend( {
		events: {
			'click': 'onClick'
		},

		template: function( model ) {
			return _( 'button', {
				className: 'cke_button',
				title: model.title
			}, [
				_( 'span', {
					className: 'cke_button_icon'
				} ),
				_( 'text', model.text )
			] );
		},

		initialize: function( options ) {
			if ( !this.model ) {
				this.model = new MVC.Model( options );
			}

			// TODO cover it using bindings
			this.listenTo( this.model, 'change:active', this.toggle, this );
		},

		onClick: function() {
			this.model.active = !this.model.active;
		},

		toggle: function( model ) {
			this.$el.toggleClass( 'active', model.active );
		}
	} );

	ui.button = function( options ) {
		return new Button( options );
	};

	return Button;
} );