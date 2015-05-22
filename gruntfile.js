module.exports = function( grunt ) {
	require( 'load-grunt-tasks' )( grunt );

	grunt.initConfig( {
		clean: {
			build: [ 'build' ]
		},

		requirejs: {
			options: {
				baseUrl: 'src',
				include: [ 'editor' ],
				out: 'build/ckeditor.js',
				optimize: 'uglify2'
			},
			almond: {
				options: {
					almond: true,
					wrap: {
						startFile: 'src/start.frag',
						endFile: 'src/end.frag'
					}
				}
			}
		},

		watch: {
			source: {
				files: [ 'src/**/*' ],
				tasks: [ 'build' ]
			}
		}
	} );

	grunt.registerTask( 'build', [ 'clean', 'requirejs:almond' ] );
	grunt.registerTask( 'default', [ 'watch' ] );
};