define( [
	'ui/button'
], function(
	Button
) {
	var CheckButton = Button.extend( {
		template: [ 'label', {
			className: Button.bindProp( 'model.active', 'isActive' ),
			title: Button.bindProp( 'model.title' ),
			children: [
				[ 'input', {
					onchange: Button.bindAttr( 'checked', 'model.active' ),
					checked: Button.bindProp( 'model.active' ),
					type: 'checkbox'
				} ],
				[ 'span', Button.bindProp( 'model.text' ) ]
			]
		} ]
	} );

	return CheckButton;
} );