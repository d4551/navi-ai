module.exports = function (grunt) {
  grunt.initConfig({
    run: {
      dev: { cmd: 'npm', args: ['run', 'dev'] },
      build: { cmd: 'npm', args: ['run', 'build'] },
      test: { cmd: 'npm', args: ['run', 'test'] },
      format: { cmd: 'npm', args: ['run', 'format'] },
      lintfix: { cmd: 'npm', args: ['run', 'lint:fix'] },
    },
  })
  grunt.loadNpmTasks('grunt-run')
  grunt.registerTask('default', ['run:build'])
}
