`use strict`;

const gulp = require(`gulp`);
const babel = require(`gulp-babel`);
const autoprefixer = require(`gulp-autoprefixer`);
const changed = require(`gulp-changed`);
const cleanCss = require(`gulp-clean-css`);
const concat = require(`gulp-concat`);
const rename = require(`gulp-rename`);
const replace = require(`gulp-replace`);
const sass = require('gulp-sass')(require('sass'));
const uglify = require(`gulp-uglify`);
// const scssLint = require(`gulp-scss-lint`);
const flatten = require("gulp-flatten");

/**
 * Asset paths.
 */
const srcSCSS = `scss/**/*.scss`;
const srcSCSSliquid = `scss/**/*.scss.liquid`;
const srcJS = `js/*.js`;
const assetsDir = `../assets/`;

/**
 * Scss lint
 */
// gulp.task(`scss-lint`, () => {
//     return gulp.src(srcSCSS)
//         .pipe(scssLint());
// });

/**
 * SCSS task
 */
gulp.task(`scss`, gulp.series(() => {
    return gulp.src(`scss/**/*.scss.liquid`)
        .pipe(sass({ outputStyle: `expanded` }).on(`error`, sass.logError))
        .pipe(autoprefixer({ cascade : false }))
        .pipe(rename((path) => {
            //console.log(path.basename);
            path.basename = path.basename.replace(`.scss`, `.css`)
            path.extname = `.liquid`;
        }))
        .pipe(flatten({ subPath: [0, -1] }))
        .pipe(replace(`"{{`, "{{"))
        .pipe(replace(`}}"`, "}}"))
        .pipe(cleanCss())
        .pipe(gulp.dest(assetsDir));
}));

/**
 * JS task
 *
 * Note: use npm to install libraries and add them below, like the babel-polyfill example
 */
const jsFiles = [
    `./node_modules/babel-polyfill/dist/polyfill.js`,
    srcJS,
];

gulp.task(`js`, () => {
    return gulp.src(jsFiles)
        .pipe(babel({
            presets: [`@babel/preset-env`]
        }))
        .pipe(concat(`theme.js`))
        .pipe(uglify())
        .pipe(gulp.dest(assetsDir));
});

/**
 * Images task
 */
gulp.task(`images`, () => {
    return gulp.src(`images/**`)
        .pipe(changed(assetsDir)) // ignore unchanged files
        .pipe(gulp.dest(assetsDir))
});

/**
 * Fonts task
 */
gulp.task(`fonts`, () => {
    return gulp.src(`fonts/**`)
        .pipe(changed(assetsDir)) // ignore unchanged files
        .pipe(gulp.dest(assetsDir))
});

/**
 * Watch task
 */
gulp.task(`watch`, () => {
    gulp.watch(srcSCSSliquid, gulp.series(`scss`));
    gulp.watch(srcSCSS, gulp.series(`scss`));
    gulp.watch(srcJS, gulp.series(`js`));
    gulp.watch(`images/*.{jpg,jpeg,png,gif,svg}`, gulp.series(`images`));
    gulp.watch(`fonts/*.{eot,svg,ttf,woff,woff2}`, gulp.series(`fonts`));
});

/**
 * Default task
 */
gulp.task(`default`, gulp.series(`scss`, `js`, `images`, `fonts`));
