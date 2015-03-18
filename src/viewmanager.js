define( [
	'tools/utils'
], function(
	utils
) {
	'use strict';

	function ViewManager() {
		this._views = {};
	}

	utils.extend( ViewManager.prototype, {
		add: function( view ) {
			this._views[ view.vid ] = view;
		},

		get: function( vid ) {
			return this._views[ vid ] || null;
		},

		getByElement: function( element ) {
			return element.dataset && element.dataset.vid && this.get( element.dataset.vid );
		},

		remove: function( vid ) {
			delete this._views[ vid ];
		}
	} );

	return new ViewManager();
} );