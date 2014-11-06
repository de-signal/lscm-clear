'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

	var modRewrite = require('connect-modrewrite');

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Update grunt packages
		devUpdate: {
			main: {
				options: {
					updateType: 'prompt', //just report outdated packages
					reportUpdated: true, //don't report already updated packages
					semver: true, //use package.json semver rules when updating
					packages: { //what packages to check
						devDependencies: true, //only devDependencies
						dependencies: false
					},
					packageJson: null //find package.json automatically
				}
			}
		},

		// Project settings
		path: {
			// configurable paths
			dev: 'app-dev',
			app: 'app'
		},


		// Cleans folders to start fresh
		clean: {
			install: {
				files: [{
					dot: true,
					src: [
						'app-dev/lib/*',
						'app-dev/components/*'
					]
				}]
			},
			app: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'app/*'
					]
				}]
			},
			hack: {
				files: [{
					dot: true,
					src: [
						'app/app', 
						'.tmp'
					]
				}]
			}
		},

		bower: {
			install: {
				options: {
					copy: false, 
					bowerOptions: {
						forceLatest: true|false,    // Force latest version on conflict
						production: true|false,     // Do not install project devDependencies
					}
				}
			}
		},

		copy: {
			install: { 
				files: [
					{
						expand: true,
						cwd: 'app-dev/components/',
						src: [
							'angular/angular.js', 
							'angular-animate/angular-animate.js',  
							'angular-cookies/angular-cookies.js', 
							'angular-route/angular-route.js', 
							'angular-resource/angular-resource.js', 
							'angular-mocks/angular-mocks.js', 
							'angular-bootstrap/ui-bootstrap-tpls.js',
							'angular-http-auth/src/http-auth-interceptor.js', 
							'ng-file-upload/angular-file-upload-html5-shim.js', 
							'ng-file-upload/angular-file-upload.js',
							'AngularJS-Toaster/toaster.js', 
							'd3/d3.js', 
							'nvd3/nv.d3.js', 
							'angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js', 
							'angular-loading-bar/build/loading-bar.js' 
						],
						dest: 'app-dev/lib/js',
						flatten: true
					},
					{
						expand: true,
						cwd: 'app-dev/components/',
						src: [
							'AngularJS-Toaster/toaster.css',
							'nvd3/nv.d3.css', 
							'angular-loading-bar/build/loading-bar.css'
						],
						dest: 'app-dev/lib/css',
						flatten: true
					}, 
					{
						expand: true,
						cwd: 'app-dev/components/bootstrap-sass/assets/stylesheets/',
						src: [
							'bootstrap/**'
						],
						dest: 'app-dev/lib/scss/'
					}
				]
			}, 
			app: { // Copies remaining files to places other tasks can use
				files: [{
					expand: true,
					dot: true,
					cwd: 'app-dev',
					dest: 'app',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						'*.html',
						'core/html/{,*/}*.html',
						'core/json/**/*', 
						'conf/img/{,*/}*.svg',
						'modules/transport/html/{,*/}*.html',
						'modules/stock/html/{,*/}*.html'
					]
				}, 
				{
					expand: true,
					dot: true,
					flatten: true,
					cwd: 'app-dev',
					dest: 'app/css/fonts',
					src: [ 'css/fonts/*']
				}]
			}
		}, 

		processhtml: {
			options: {
				commentMarker: 'update', 
			},
			app: {
				files: {
					'app/index.html': ['app/index.html']
				}
			}
		},


		preprocess: {
			js : {
				src : [ '.tmp/concat/js/app.js' ],
				options: {
					inline : true,
					context : {
						DEBUG: false
					}
				}
			}
		},

		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			app: {
				files: [{
					expand: true,
					cwd: 'app-dev',
					src: [
						'conf/img/{,*/}*.{png,jpg,jpeg,gif}', 
						'modules/transport/img/{,*/}*.{png,jpg,jpeg,gif}', 
						'modules/stock/img/{,*/}*.{png,jpg,jpeg,gif}'
					],
					dest: 'app'
				}]
			}
		},
		htmlmin: {
			app: {
				options: {
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					removeCommentsFromCDATA: true,
					removeOptionalTags: true
				},
				files: [{
					expand: true,
					cwd: 'app',
					src: ['*.html', '{,*/}*.html'],
					dest: 'app'
				}]
			}
		},
		// Renames files for browser caching purposes
		filerev: {
			files: {
				src: [
					'app/js/{,*/}*.js',
					'app/css/{,*/}*.css'
				]
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			html: 'app-dev/index.html',
			options: {
				dest: 'app'
			}
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			html: ['app/{,*/}*.html'],
			css: ['app/css/{,*/}*.css'],
			options: {
				assetsDirs: ['app']
			}
		}, 
		compass: {
			dist: {
				options: {
					sassDir: 'src/scss',
					specify: 'src/scss/styles.scss',
					cssDir: 'dist',
					environment: 'production'
				}
			},
			dev: {                    
				options: {
					sassDir: 'app-dev/core/scss',
					specify: 'app-dev/core/scss/app.scss',
					cssDir: 'app-dev/css'
				}
			}
		}, 

		'ftp-deploy': {
			app: {
			auth: {
				host: 'ftp.ofon2.com',
				port: 21,
				authKey: 'ofon2'
			},
			src: 'app/',
			dest: 'app/',
			exclusions: ['**/.DS_Store', '**/Thumbs.db']
			}
		}, 

		// The actual grunt server settings
		connect: {
			options: {
				port: 9000,
				livereload: 35729,
				hostname: 'localhost', 
				open: true
			},
			server: {
				options: {
					open: {
						target: 'http://localhost:9000/app-dev/dashboard?s=1'
					},
					middleware: function (connect) {
						return [
							modRewrite(['^[^\\.]*$ /app-dev/index.html [L]']),
							connect.static('.')
						];
					}
				}
			}
		},

		watch: {
			dev: {
				options: { livereload: true },
				files: [
					'app-dev/core/js/{,*/}*.js', 
					'app-dev/core/html/{,*/}*.html', 
					'app-dev/mock/*.js'
				]
			},
			css: {
				options: { livereload: true },
				files: ['app-dev/core/scss/*.scss'],
				tasks: ['default'],
			}
		},

	});


	grunt.registerTask('dep', [
		'devUpdate:main'
	]);

	grunt.registerTask('default', [
		'compass:dev'
	]);

	grunt.registerTask('install', [
		'clean:install',
		'bower:install',
		'copy:install'
	]);

	grunt.registerTask('app', [
		'clean:app',
		'useminPrepare',
		'concat:generated',
		'preprocess:js',
		'imagemin:app',
		'copy:app',
		'processhtml:app',
		'cssmin:generated',
		'uglify:generated',
		'filerev',
		'usemin',
		'htmlmin:app',
		'clean:hack'
	]);

	grunt.registerTask('deploy', [
		'ftp-deploy:app'
	]);

	grunt.registerTask('serve', [
		'connect:server', 
		'watch:dev'
	]);
};
