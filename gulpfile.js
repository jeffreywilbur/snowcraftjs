/// <binding BeforeBuild='completeBuild' />
var gulp = require('gulp');
var terser = require('gulp-terser');
var concat = require('gulp-concat');
var sass = require('gulp-sass')(require('node-sass'));
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require('tsify');
var buffer = require('vinyl-buffer');
var mergeStream =   require('merge-stream');

var styleSrc = [
    "./src/style.scss"
];

var scriptSrc = [
    "./src/logic.ts"
]

var paths = {
    scriptsDest: "./wwwroot/game",
    stylesDest: "./wwwroot/game",
    nodeModules: "./node_modules/"
};

function buildStyles() {
    return gulp.src(styleSrc)
    .pipe(sass({
        outputStyle: 'compressed',
        omitSourceMapUrl: true
    }).on('error', sass.logError))
    .pipe(concat("main.css"))
    .pipe(gulp.dest(paths.stylesDest));  
}

function buildScripts() {
    return browserify({
            basedir: '.',
            debug: false,
            entries: scriptSrc,
            cache: {},
            packageCache: {}
        })
        .plugin(tsify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest(paths.scriptsDest));
}

function buildScriptsProd() {
    return browserify({
            basedir: '.',
            debug: false,
            entries: scriptSrc,
            cache: {},
            packageCache: {}
        })
        .plugin(tsify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(terser({
            mangle: true,
            toplevel: true
        }))
        .pipe(gulp.dest(paths.scriptsDest));
}

var build = gulp.parallel(buildScripts, buildStyles);
var buildProd = gulp.parallel(buildScriptsProd, buildStyles);

exports.watch = function() {
    gulp.watch(
        [paths.stylesRoot,paths.tsRoot],
        gulp.parallel(
            buildScripts,
            buildStyles
        )
    );
};

exports.build = build;
exports.buildProd = buildProd;
exports.default = build;