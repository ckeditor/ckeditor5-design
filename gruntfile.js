module.exports = function( grunt ) {
	require( 'load-grunt-tasks' )( grunt );

	grunt.initConfig( {
		clean: {
			build: [ 'build' ]
		},

		copy: {
			build: {

			}
		},

		htmlrefs: {
			build: {

			}
		},

		requirejs: {
			build: {
				options: {
					almond: true,
					baseUrl: 'src',
					include: [ 'ckeditor' ],
					out: 'build/ckeditor.js',
					optimize: 'none',
					useStrict: true,
					wrap: {
						startFile: 'src/start.frag',
						endFile: 'src/end.frag'
					}
				}
			}
		}
	} );

	grunt.registerTask( 'build', [ 'clean', 'requirejs' ] );
	grunt.registerTask( 'default', [ 'build' ] );
};