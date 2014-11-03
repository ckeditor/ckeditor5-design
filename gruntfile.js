module.exports = function( grunt ) {
	require( 'load-grunt-tasks' )( grunt );

	grunt.initConfig( {
		clean: {
			build: [ 'build' ]
		},

		requirejs: {
			options: {
				baseUrl: 'src',
				include: [ 'CKEDITOR' ],
				out: 'build/ckeditor.js',
				optimize: 'none'
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
				files: [ 'src/**/*', 'dev/**/*' ],
				tasks: [ 'build:almond' ]
			}
		}
	} );

	grunt.registerTask( 'build:almond', [ 'clean', 'requirejs:almond' ] );
	grunt.registerTask( 'build:amdclean', [ 'clean', 'requirejs:amdclean' ] );
	grunt.registerTask( 'default', [ 'watch' ] );
};