/**
 * Bender configuration file
 *
 * @param {Object}   applications       Applications used in current project
 * @param {Array}    browsers           List of browsers used for testing
 * @param {Number}   captureTimeout     Timeout before which a launched browser should connect to the server
 * @param {Boolean}  debug              Enable debug logs
 * @param {Number}   defermentTimeout   Timeout before which a plugin should finish initializing on a test page
 * @param {String}   framework          Default framework used for the tests
 * @param {String}   hostname           Host on which the HTTP and WebSockets servers will listen
 * @param {Array}    manualBrowsers     List of browsers accepting manual tests
 * @param {Number}   manualTestTimeout  Timeout after which a manual test is marked as failed
 * @param {Array}    plugins            List of Bender plugins to load at startup (Required)
 * @param {Number}   port               Port on which the HTTP and WebSockets servers will listen
 * @param {Number}   slowAvgThreshold   Average test case duration threshold above which a test is marked as slow
 * @param {Number}   slowThreshold      Test duration threshold above which a test is marked as slow
 * @param {String}   startBrowser       Name of a browser to start when executing bender run command
 * @param {Number}   testRetries        Number of retries to perform before marking a test as failed
 * @param {Object}   tests              Test groups for the project (Required)
 * @param {Number}   testTimeout        Timeout after which a test will be fetched again
 */

var config = {
	amd: {
		baseUrl: '/apps/prototype/'
	},

	applications: {
		'prototype': {
			path: 'src/',
			files: [ 's' ]
		}
	},

	framework: 'mocha',

	// put your configuration here
	plugins: [
		'benderjs-amd',
		'benderjs-mocha',
		'benderjs-chai'
	],

	tests: {
		'All': {
			applications: [ 'prototype' ],
			basePath: 'tests/',
			paths: [
				'**/*',
				'!**/_assets/**'
			]
		}
	}
};

module.exports = config;