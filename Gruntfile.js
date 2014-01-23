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

		// Project settings
		path: {
			// configurable paths
			dev: 'app-dev',
			app: 'app'
		},


		// Empties folders to start fresh
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
				files: [{
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
						'ngUpload/ng-upload.js',
						'AngularJS-Toaster/toaster.js', 
						'd3/d3.js', 
						'nvd3/nv.d3.js', 
						'angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js'
					],
					dest: 'app-dev/lib/js',
					flatten: true
				}, 
				{
					expand: true,
					cwd: 'app-dev/components/',
					src: [
						'bootstrap/dist/css/bootstrap.css',
						'AngularJS-Toaster/toaster.css',
						'nvd3/nv.d3.css'
					],
					dest: 'app-dev/lib/css',
					flatten: true
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
						'json/*'
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
			hack: { // Copies remaining files to places other tasks can use
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
		svgmin: {
			app: {
				files: [{
					expand: true,
					cwd: 'app-dev/img',
					src: '{,*/}*.svg',
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
		}
	});



	grunt.registerTask('install', [
		'clean:install',
		'bower:install',
		'copy:install'
	]);
	grunt.registerTask('app', [
		'clean:app',
    	'useminPrepare',
		'imagemin:app',
		'svgmin:app',
		'concat',
		'copy:app',
		'processhtml:app',
	    'cssmin',
	    'uglify',
		'rev',
    	'usemin',
		'htmlmin:app',
		'copy:hack',
		'clean:hack'
	]);
};
