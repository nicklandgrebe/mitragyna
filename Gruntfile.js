module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // configure the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: {
        src: [ 'dist' ]
      },
      build: {
        src: [
          'build/**/*.js',
          '!build/mitragyna.js', '!build/mitragyna.min.js'
        ]
      },
      specs: {
        src: 'spec/spec.js'
      }
    },
    babel: {
      options: {
        sourceMap: true,
        minified: true,
        presets: ['env'],
        plugins: [
          'transform-class-properties',
          'transform-es2015-modules-umd',
          'transform-object-rest-spread',
          'transform-react-jsx'
        ]
      },
      build: {
        files: {
          'build/mitragyna.min.js': 'build/mitragyna.jsx'
        }
      },
      specs: {
        files: {
          'spec/spec.js': [ 'spec/**/*.jsx' ]
        }
      }
    },
    concat: {
      release: {
        options: {
          banner:
          '/*\n' +
          '\tmitragyna <%= pkg.version %>\n' +
          '\t(c) <%= grunt.template.today("yyyy") %> Nick Landgrebe\n' +
          '\tmitragyna may be freely distributed under the MIT license\n' +
          '*/\n\n'
        },
        files: {
          'dist/mitragyna.js': ['build/mitragyna.js'],
          'dist/mitragyna.min.js': ['build/mitragyna.min.js'],
          'dist/mitragyna.min.js.map': ['build/mitragyna.min.js.map']
        }
      },
      build: {
        src: [
          'src/Collection.jsx',
          'src/ErrorsFor.jsx',
          'src/Input.jsx',
          'src/Resource.jsx'
        ],
        dest: 'build/mitragyna.jsx'
      }
    },
    connect: {
      test: {
        options: {
          port: 8000
        }
      }
    }

  });

  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-umd');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // define the tasks
  grunt.registerTask(
    'compile',
    'Compiles the source files into 1) a raw UMD module file and 2) a minified UMD module file.',
    [ 'concat:build', 'babel:build', 'clean:build' ]
  );

  grunt.registerTask(
    'spec',
    'Compiles and runs the Javascript spec files for source code.',
    [ 'clean:specs', 'babel:specs', 'connect:test' ]
  );

  grunt.registerTask(
    'build',
    'Creates a temporary build of the library in the build folder, then runs the specs on it.',
    [ 'clean:build', 'compile' ]
  );

  grunt.registerTask(
    'release',
    'Creates a new release of the library in the dist folder',
    [ 'clean:dist', 'compile', 'concat:release' ]
  );

  grunt.registerTask(
    'default',
    'Watches the project for changes, automatically builds them and runs specs.',
    [ 'build', 'watch' ]
  );
};
