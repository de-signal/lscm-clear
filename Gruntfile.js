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
							'angular-bootstrap/ui-bootstrap-tpls.js',
							'angular-http-auth/src/http-auth-interceptor.js', 
							'ng-file-upload/angular-file-upload-html5-shim.js', 
							'ng-file-upload/angular-file-upload.js',
							'AngularJS-Toaster/toaster.js', 
							'd3/d3.js', 
							'nvd3/nv.d3.js', 
							'angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js', 
							'angular-loading-bar/build/loading-bar.js', 
							'planetary.js/dist/planetaryjs.js',
							'topojson/topojson.js' 
						],
						dest: 'app-dev/lib/js',
						flatten: true
					},
					{
						expand: true,
						cwd: 'app-dev/components/',
						src: [
							'planetary.js/dist/world-110m.json'
						],
						dest: 'app-dev/lib/json',
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
						'partials/{,*/}*.html',
						'json/**/*', 
						'img/{,*/}*.svg'
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
			}, 
			hack: { // remove two folder-levels because of usemin mis-understanding of css relative path
				files: [{
					expand: true,
					dot: true,
					cwd: 'app/app/css',
					dest: 'app/css',
					src: [ '*.css']
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

		// Allow the use of non-minsafe AngularJS files. Automatically makes it
	    // minsafe compatible so Uglify does not destroy the ng references
	    ngmin: {
	      dist: {
	        files: [{
	          expand: true,
	          cwd: '.tmp/concat/js',
	          src: '*.js',
	          dest: '.tmp/concat/js'
	        }]
	      }
	    },
		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			app: {
				files: [{
					expand: true,
					cwd: 'app-dev/img',
					src: '{,*/}*.{png,jpg,jpeg,gif}',
					dest: 'app/img'
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
		rev: {
			app: {
				files: {
					src: [
						'app/js/{,*/}*.js',
						'app/css/{,*/}*.css'
					]
				}
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
					sassDir: 'app-dev/scss',
					specify: 'app-dev/scss/app.scss',
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
		}

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
		'imagemin:app',
		'concat',
		'copy:app',
		'processhtml:app',
	    'cssmin',
	    'uglify',
		'rev',
    	'usemin',
		'htmlmin:app',
		'copy:hack',
		'clean:hack', 
		'ftp-deploy:app'
	]);
};
