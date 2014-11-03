module.exports = function( grunt ) {
	require( 'load-grunt-tasks' )( grunt );

	grunt.initConfig( {
		clean: {
			build: [ 'build' ]
		},

		requirejs: {
			almond: {
				options: {
					almond: true,
					baseUrl: 'src',
					include: [ 'CKEDITOR' ],
					out: 'build/ckeditor.js',
					// optimize: 'none',
					wrap: {
						startFile: 'src/start.frag',
						endFile: 'src/end.frag'
					}
				}
			},
			amdclean: {
				options: {
					baseUrl: 'src',
					include: [ 'CKEDITOR' ],
					out: 'build/ckeditor.js',
					// optimize: 'none',
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
		}
	} );

	grunt.registerTask( 'build:almond', [ 'clean', 'requirejs:almond' ] );
	grunt.registerTask( 'build:amdclean', [ 'clean', 'requirejs:amdclean' ] );
	grunt.registerTask( 'default', [ 'build:almond' ] );
};