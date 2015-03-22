module.exports = (grunt) ->

	# Project configuration
	grunt.initConfig {
		pkg: grunt.file.readJSON('package.json')
		concat: {
			options: {
				separator: ';'
			}
			dist: {
				src: ['vendor/jquery.mousewheel.js', 'vendor/interact-1.2.4.js', 'node_modules/moment/moment.js','node_modules/lodash/index.js', 'src/axes.js',  'src/chart.js', 'src/main.js']
				dest: 'build/<%= pkg.name %>.js'
			}
		}
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			}
			build: {
				src: 'build/<%= pkg.name %>.js'
				dest: 'build/<%= pkg.name %>.min.js'
			}
		}
		sass: {
			dist: {
				options: {
					style: 'expanded'
				}
				files: {
					'build/<%= pkg.name %>.css': 'css/<%= pkg.name %>.sass',
				}
			}
		}
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			}
			target: {
				files: {
					'build/<%= pkg.name %>.min.css': 'build/<%= pkg.name %>.css'
				}
			}
		}
	}

	grunt.loadNpmTasks('grunt-contrib-concat')

	grunt.loadNpmTasks('grunt-contrib-uglify')

	grunt.loadNpmTasks('grunt-contrib-sass')

	grunt.loadNpmTasks('grunt-contrib-cssmin')


	# Default task(s)
	grunt.registerTask('default', ['concat', 'sass', 'uglify', 'cssmin'])

