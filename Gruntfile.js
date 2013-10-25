module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*\n<%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n<%= pkg.description %>\nLovingly coded by <%= pkg.author.name %>  - <%= pkg.author.url %> \n*/\n',
		less: {
			dist: {
				options: {
					paths: ['public/css/less']
				},
				files: {
					'public/css/main.css': 'public/css/less/main.less'
				}
			}
		},
		cssmin: {
			combine: {
				options: {
					banner: '<%= banner %>'
				},
				files: {
					'public/css/<%= pkg.name %>.min.css': ['public/css/normalize.css', 'public/css/main.css']
				}
			}
		},
		concat: {
			options: {
				separator: '',
				stripBanners: {
					block: true,
					line: true
				},
				banner: '<%= banner %>'
			},
			dist: {
				src: ['public/js/lib/example5.js', 'public/js/main.js'],
				dest: 'public/js/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				files: {
					'public/js/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		}
	});
	
	grunt.registerTask('build', [
		'less:dist',
		'cssmin',
		'concat:dist',
		'uglify:dist'
	]);

	grunt.registerTask('default', 'build');
}