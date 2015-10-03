var browserify = require('browserify');

browserify('../src/wrapper.js', {
    builtins: false,
    browserField: false,
    insertGlobalVars: {
        process: function() {
            return;
        },
    },
})
    .bundle()
    .pipe(process.stdout);
