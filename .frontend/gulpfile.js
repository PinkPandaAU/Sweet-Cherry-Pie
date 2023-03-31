const gulp = require('gulp'),
    concat = require('gulp-concat'),
    autoprefix = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    cache = require('gulp-cached'),
    del = require('del'),
    rigger = require('gulp-rigger'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    connect = require('gulp-connect-php'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    through = require('through2'),
    favicons = require('gulp-favicons');

config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 3333,
},
    src = {
        php: 'src/*.php',
        html: 'src/*.html',
        json: 'src/json/*.json',
        video: 'src/video/*',
        partsHtml: 'src/parts/*.html',
        csslib: 'src/scss/plugins/*.scss',
        cssmain: 'src/scss/main/index.scss',
        cssdev: [
            'src/scss/mixins/*.scss',
            'src/scss/index.scss',
        ],
        jslib: 'src/js/plugins/*.js',
        jsdev: 'src/js/*.js',
        images: 'src/images/**/*.*'
    },
    build = {
        images: 'build/images',
        css: 'build/css',
        js: 'build/js',
        json: 'build/json',
        video: 'build/video',
        html: 'build/',
    };

function fav() {
    return gulp.src('src/favicons/favicon.png').pipe(
        favicons({
            settings: {
                appName: 'Project',
                appShortName: 'Project',
                appDescription: 'Project',
                path: 'src/favicons/',
                url: 'Project',
                display: 'standalone',
                orientation: 'portrait',
                scope: '',
                start_url: '',
                version: 1.0,
                logging: false,
                html: 'index.html',
                pipeHTML: true,
                replace: true,
                background: '#ffffff',
                vinylMode: true
            }
        }))
        .pipe(through.obj(function (file, enc, cb) {
            this.push(file);
            cb();
        })).pipe(gulp.dest('build/favicons/'));
}

function favSvg() {
    return gulp.src('src/favicons/favicon.svg')
        .pipe(gulp.dest('build/favicons/'))
}

function fonts() {
    return gulp.src('src/fonts/**/*.{eot,svg,ttf,woff,woff2,otf}')
        .pipe(gulp.dest('build/fonts'))
}

function img() {
    return gulp.src(src.images)
        .pipe(cache())
        .pipe(gulp.dest(build.images))
        .pipe(browserSync.stream());
}

function video() {
    return gulp.src(src.video)
        .pipe(cache())
        .pipe(gulp.dest(build.video))
        .pipe(browserSync.stream());
}

function imgmin() {
    return gulp.src(src.images)
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(build.images))
}

function php() {
    return gulp.src(src.php)
        .pipe(rigger())
        .pipe(gulp.dest(build.html))
        .pipe(browserSync.stream());
}

function html() {
    return gulp.src(src.html)
        .pipe(rigger())
        .pipe(gulp.dest(build.html))
        .pipe(browserSync.stream());
}

function json() {
    return gulp.src(src.json)
        .pipe(rigger())
        .pipe(gulp.dest(build.json))
        .pipe(browserSync.stream());
}

function pluginsCSS() {
    return gulp.src(src.csslib)
        .pipe(cache())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('plugins.css'))
        .pipe(cleanCSS({level: 2}))
        .pipe(gulp.dest(build.css));
}

function mainCSS() {
    return gulp.src(src.cssmain)
        // .pipe(cache())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(autoprefix())
        .pipe(cleanCSS({level: 1}))
        .pipe(gulp.dest(build.css))
        .pipe(browserSync.stream());
}


function devCSS() {
    return gulp.src(src.cssdev)
        // .pipe(cache())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(autoprefix())
        .pipe(cleanCSS({level: 1}))
        .pipe(gulp.dest(build.css))
        .pipe(browserSync.stream());
}

function pluginsJS() {
    return gulp.src(src.jslib)
        .pipe(cache())
        .pipe(concat('plugins.js'))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(gulp.dest(build.js));
}

function devJS() {
    return gulp.src(src.jsdev)
        .pipe(cache())
        .pipe(gulp.dest(build.js))
        .pipe(browserSync.stream());
}

function cleanBuild() {
    return del(['build/*'])
}

function watch() {
    browserSync.init(config);
    // gulp.watch(src.cssdev, devCSS).on('change', browserSync.reload)
    gulp.watch('src/scss/main/*.scss', mainCSS);
    gulp.watch('src/scss/**/*.scss', devCSS);
    gulp.watch(src.jsdev, devJS).on('change', browserSync.reload);
    gulp.watch(src.images, img).on('change', browserSync.reload);
    gulp.watch(src.json, json).on('change', browserSync.reload);
    gulp.watch(src.html, html).on('change', browserSync.reload);
    gulp.watch(src.partsHtml, html).on('change', browserSync.reload);
    gulp.watch(src.php, php).on('change', browserSync.reload);
}

gulp.task('connect', function () {
    connect.server({
        base: './build'
    });
});

gulp.task('fav', fav);
gulp.task('favSvg', favSvg);
gulp.task('img', img);
gulp.task('imgmin', imgmin);
gulp.task('php', php);
gulp.task('json', json);
gulp.task('fonts', fonts);
gulp.task('html', html);
gulp.task('video', video);
gulp.task('cleanBuild', cleanBuild);
gulp.task('pluginsCSS', pluginsCSS);
gulp.task('mainCSS', mainCSS);
gulp.task('devCSS', devCSS);
gulp.task('pluginsJS', pluginsJS);
gulp.task('devJS', devJS);
gulp.task('watch', watch);
gulp.task('build', gulp.series(
    // 'cleanBuild',   опціонально
    gulp.parallel('fav', 'favSvg', 'mainCSS', 'devCSS', 'pluginsCSS', 'devJS', 'pluginsJS', 'fonts', 'html', 'video', 'json', 'php', 'img')
));
gulp.task('default', gulp.series('build', 'watch'));
gulp.task('php', gulp.series('build',
    gulp.parallel('watch', 'connect')
));