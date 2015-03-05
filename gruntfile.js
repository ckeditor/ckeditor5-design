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
			},
			amdclean: {
				options: {
					onModuleBundleComplete: function( data ) {
						var fs = require( 'fs' ),
							amdclean = require( 'amdclean' ),
							path = data.path;

						fs.writeFileSync( path, amdclean.clean( {
							filePath: path,
							globalModules: [ 'CKEDITOR' ]
						} ) );
					}
				}
			}
		},

		watch: {
			source: {
				files: [ 'src/**/*' ],
				tasks: [ 'build:almond' ]
			}
		}
	} );

	grunt.registerTask( 'build:almond', [ 'clean', 'requirejs:almond' ] );
	grunt.registerTask( 'build:amdclean', [ 'clean', 'requirejs:amdclean' ] );
	grunt.registerTask( 'default', [ 'watch' ] );
};