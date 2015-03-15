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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bower-task');
};
