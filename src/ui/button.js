define( [
	'ui',
	'core/mvc'
], function(
	ui,
	MVC
) {
	'use strict';

	var Button = MVC.View.extend( {
		template: [
			'button', {
				className: MVC.View.bindProp( 'model.active', 'isActive' ),
				id: 'foo',
				onclick: 'click',
				title: MVC.View.bindProp( 'model.title' ),
				children: [
					[ 'span', {
						className: 'icon'
					} ],
					[ 'span', MVC.View.bindProp( 'model.text' ) ]
				]
			}
		],

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
		}
	} );

	ui.button = function( options ) {
		return new Button( options );
	};

	return Button;
} );