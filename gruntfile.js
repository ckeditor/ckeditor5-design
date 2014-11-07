module.exports = function( grunt ) {
	require( 'load-grunt-tasks' )( grunt );

	var pkg = grunt.file.readJSON( 'package.json' );

	function getPlugins() {
		return Object.keys( pkg.dependencies )
			.filter( function( name ) {
				return name.indexOf( 'ckeditor-plugin-' ) === 0;
			} ).map( function( name ) {
				return 'plugins!' + name.replace( 'ckeditor-plugin-', '' );
			} );
	}

	grunt.initConfig( {
		clean: {
			build: [ 'build' ],
			tmp: [ 'tmp' ]
		},

		requirejs: {
			build: {
				options: {
					almond: true,
					baseUrl: 'tmp/ckeditor-core/src/',
					generateSourceMaps: true,
					include: [ 'ckeditor' ].concat( getPlugins() ),
					optimize: 'none',
					out: 'build/ckeditor.js',
					wrap: {
						start: '(function (root) {',
						end: 'root.CKEDITOR = root.CKEDITOR || {};\n' +
							'CKEDITOR.define = CKEDITOR.define || define;\n' +
							'CKEDITOR.require = CKEDITOR.require || require;\n' +
							'})(this);'
					}
				}
			}
		},

		sed: {
			build: {
				path: 'tmp/',
				pattern: /^(CKEDITOR\.)(define|require)/,
				replacement: '$2',
				recursive: true
			}
		}
	} );

	grunt.loadTasks( 'tasks/' );
	grunt.registerTask( 'build', [ 'clean', 'copy', 'sed', 'requirejs', 'clean:tmp' ] );
	grunt.registerTask( 'default', [ 'build' ] );
};
