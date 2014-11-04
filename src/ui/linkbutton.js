define( [
	'ui/button'
], function(
	Button
) {
	var LinkButton = Button.extend( {
		template: [ 'a', {
			className: Button.bindProp( 'model.active', 'isActive' ),
			href: 'javascript:;',
			onclick: 'click',
			title: Button.bindProp( 'model.title' ),
			children: [
				[ 'span', Button.bindProp( 'model.text' ) ]
			]
		} ]
	} );

	return LinkButton;
} );