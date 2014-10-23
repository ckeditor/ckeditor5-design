define( [
	'editor/editor'
], function(
	Editor
) {
	var CKEDITOR = {
		_instances: []
	};

	CKEDITOR.create = function( selector, options ) {
		var instance = new Editor( selector, options );
		this._instances.push( instance );
	};

	return CKEDITOR;
} );