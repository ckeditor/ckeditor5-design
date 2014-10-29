define( [
	'ui',
	'core/mvc',
	'tools/dombuilder2'
], function(
	ui,
	MVC,
	_
) {
	var Button = MVC.View.extend( {
		initialize: function( options ) {
			if ( !this.model ) {
				this.model = new MVC.Model( options );
			}
		},

		template: function( model ) {
			return _( 'button.cke_button', {
				className: _.watchProp( model, 'active', function( value ) {
					return value ? 'active' : '';
				} ),
				onclick: this.click.bind(this)
			}, [
				_( 'span.cke_button_icon' ),
				_( 'span', {
					textContent: _.watchProp( model, 'text' )
				} )
			] );
		},

		click: function() {
			this.model.active = !this.model.active;
		}
	} );

	ui.button = function( options ) {
		return new Button( options );
	};

	return Button;
} );