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
          'css/bootstrap.min.css': ['lib/bootstrap/bootstrap.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('minify', ['uglify:min', 'cssmin:target']);
};
