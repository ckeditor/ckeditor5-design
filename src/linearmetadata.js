define( [ 'lineardata', 'tools/utils' ], function( LinearData, utils ) {
	'use strict';

	function LinearMetaData() {
		LinearData.apply( this, arguments );
	}

	utils.inherit( LinearMetaData, LinearData );

	return LinearMetaData;
} );