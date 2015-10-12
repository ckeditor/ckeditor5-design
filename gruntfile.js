/* jshint node: true */

'use strict';

module.exports = function( grunt ) {
	// First register the "default" task, so it can be analyzed by other tasks.
	grunt.registerTask( 'default', [ 'jshint:git', 'jscs:git' ] );

	// Basic configuration which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' )
	} );

	// Finally load the tasks.
	grunt.loadTasks( 'dev/tasks' );
};
