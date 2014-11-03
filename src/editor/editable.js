define( [
	'core/mvc',
	'tools/emitter',
	'tools/utils'
], function(
	mvc,
	Emitter,
	utils
) {
	function Editable( options ) {
		this.src = options.src ? options.src.html() : '';
	}

	utils.extend( Editable.prototype, Emitter, {

	} );

	return Editable;
} );