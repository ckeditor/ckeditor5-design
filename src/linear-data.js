define( [
	'store',
	'tools/utils'
], function(
	Store,
	utils
) {
	'use strict';

	function LinearData( data, store ) {
		this.data = data || [];
		this.store = store || new Store();
	}

	utils.extend( LinearData.prototype, {



	} );

	return LinearData;
} );