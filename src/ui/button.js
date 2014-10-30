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

		template: [
			'button', {
				className: 'model.active:isActive', // TODO how to pass a mutation function
				id: 'foo',
				onclick: 'click',
				title: 'model.title',
				children: [
					[ 'span', {
						className: 'icon'
					} ],
					[ 'span', {
						textContent: 'model.text'
					} ]
				]
			}
		]
	} );

	ui.button = function( options ) {
		return new Button( options );
	};

	return Button;
} );