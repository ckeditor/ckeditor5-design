define( [
	'ui',
	'core/mvc'
], function(
	ui,
	MVC
) {
	var Button = MVC.View.extend( {
		click: function() {
			this.model.active = !this.model.active;
		},

		initialize: function( options ) {
			if ( !this.model ) {
				this.model = new MVC.Model( options );
			}
		},

		isActive: function( value ) {
			return value ? 'active' : '';
		},

		template: function() {
			return [
				'button', {
					className: this.watchProp( this.model, 'active', this.isActive ),
					onclick: this.click.bind( this ),
					title: this.watchProp( this.model, 'title' )
				},
				[
					[ 'span', {
						className: 'icon'
					} ],
					[ 'span', {
						textContent: this.watchProp( this.model, 'text' )
					} ]
				]
			];
		}
	} );

	ui.button = function( options ) {
		return new Button( options );
	};

	return Button;
} );