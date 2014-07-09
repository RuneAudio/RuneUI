'use strict';
module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'assets/js/*.js',
        '!assets/js/runeui.min.js',
		'!assets/js/vendor/*.js'
      ]
    },
    less: {
      dist: {
        options: {
          compile: true,
          compress: true
        },
        files: {
          'assets/css/runeui.css': [
            'assets/less/runeui.less'
          ]
        }
      }
    },
    uglify: {
    dist: {
        files: {
          'assets/js/runeui.min.js': [
            'assets/js/runeui.js'
          ]
        }
      }
    },
    watch: {
      less: {
        files: [
          'assets/less/*.less',
          'assets/less/bootstrap/*.less',
          'assets/less/bootstrap-select/*.less',
          'assets/less/csspinner/*.less',
          'assets/less/themes/*.less',
          'assets/less/toggle-switch/*.less',
        ],
        tasks: ['less']
      },
      js: {
        files: [
          '<%= jshint.all %>'
        ],
        tasks: ['jshint', 'uglify']
        // tasks: ['jshint']
      },
      livereload: {
        // Browser live reloading
        // https://github.com/gruntjs/grunt-contrib-watch#live-reloading
        options: {
          livereload: false
        },
        files: [
          'assets/css/runeui.css',
          'assets/js/runeui.min.js',
          'app/*.php',
          'app/templates/*.php',
          '*.php'
        ]
      }
    },
    clean: {
      dist: [
        'assets/css/runeui.css',
        'assets/js/runeui.min.js'
      ]
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Register tasks
  grunt.registerTask('default', [
    'clean',
    'less',
    'uglify'
  ]);
  grunt.registerTask('dev', [
    'watch'
  ]);

};
