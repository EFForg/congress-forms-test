module.exports = function(grunt){
  grunt.initConfig({
    bower: {
      install: {
        //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
      },
      options: {
        targetDir: "lib"
      }
    },
    copy: {
      main: {
        files: [
          {
            src: 'bower_components/codemirror/mode/javascript/javascript.js',
            dest: 'lib/codemirror/mode/javascript/javascript.js'
          }
        ],
        options: {
          process: function (content, srcpath) {
            return content.replace(/..\/..\/lib\/codemirror/g,"../../codemirror.min");
          }
        }

      }
    },
    uglify: {
      min: {
        files: grunt.file.expandMapping(['lib/**/*.js'], 'js/', {
          rename: function(destBase, destPath) {
            return destBase+destPath.replace('.js', '.min.js');
          }
        })
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'css/bootstrap.min.css': ['lib/bootstrap/bootstrap.css'],
          'js/lib/codemirror/codemirror.min.css': ['lib/codemirror/codemirror.css'],
          'js/lib/jquery-growl/jquery.growl.min.css': ['lib/jquery-growl/jquery.growl.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('build', ['bower:install', 'copy:main']);
  grunt.registerTask('minify', ['uglify:min', 'cssmin:target']);
};
