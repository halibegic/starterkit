const { src, dest, watch, series, parallel } = require('gulp');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const htmlExtend = require('gulp-html-extend');
const imagemin = require('gulp-imagemin');
const options = require('./config');
const postcss = require('gulp-postcss');
const precss = require('precss');
const purgecss = require('gulp-purgecss');
const tailwindcss = require('tailwindcss');
const terser = require('gulp-terser');

// Server
function livePreview(done) {
    browserSync.init({
        server: {
            baseDir: options.paths.dist.base,
        },
        port: options.config.port || 5000,
    });
    done();
}

function previewReload(done) {
    browserSync.reload();
    done();
}

// Dev
function devClean() {
    return del([options.paths.dist.base]);
}

function devStyles() {
    return src(`${options.paths.src.css}/**/*.css`)
        .pipe(postcss([precss, tailwindcss(options.config.tailwindjs), autoprefixer]))
        .pipe(dest(options.paths.dist.css));
}

function devImages() {
    return src(`${options.paths.src.img}/**/*`).pipe(dest(options.paths.dist.img));
}

function devScripts() {
    return src([`${options.paths.src.js}/libs/**/*.js`, `${options.paths.src.js}/**/*.js`])
        .pipe(concat({ path: 'scripts.js' }))
        .pipe(dest(options.paths.dist.js));
}

function devHTML() {
    return src(`${options.paths.src.html}/**/!(_)*.html`)
        .pipe(
            htmlExtend({
                annotations: false,
                verbose: false,
            })
        )
        .pipe(dest(options.paths.dist.base));
}

function watchFiles() {
    watch(
        [options.config.tailwindjs, `${options.paths.src.css}/**/*.css`],
        series(devStyles, previewReload)
    );
    watch(`${options.paths.src.js}/**/*.js`, series(devScripts, previewReload));
    watch(`${options.paths.src.img}/**/*`, series(devImages, previewReload));
    watch(`${options.paths.src.html}/**/*.html`, series(devHTML, devStyles, previewReload));
}

// Prod

function prodClean() {
    return del([options.paths.build.base]);
}

function prodStyles() {
    return src(`${options.paths.src.css}/**/*.css`)
        .pipe(postcss([precss, tailwindcss(options.config.tailwindjs), autoprefixer]))
        .pipe(
            purgecss({
                content: ['src/**/*.{html,js}'],
                defaultExtractor: (content) => {
                    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
                    const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
                    return broadMatches.concat(innerMatches);
                },
            })
        )
        .pipe(cleanCSS({ level: { 1: { specialComments: 0 } } }))
        .pipe(dest(options.paths.build.css));
}

function prodImages() {
    return src(options.paths.src.img + '/**/*')
        .pipe(imagemin())
        .pipe(dest(options.paths.build.img));
}

function prodScripts() {
    return src([`${options.paths.src.js}/libs/**/*.js`, `${options.paths.src.js}/**/*.js`])
        .pipe(concat({ path: 'scripts.js' }))
        .pipe(terser())
        .pipe(dest(options.paths.build.js));
}

function prodHTML() {
    return src(`${options.paths.src.html}/**/!(_)*.html`)
        .pipe(
            htmlExtend({
                annotations: false,
                verbose: false,
            })
        )
        .pipe(dest(options.paths.build.base));
}

function buildFinish(done) {
    done();
}

exports.default = series(
    devClean,
    parallel(devStyles, devImages, devScripts, devHTML),
    livePreview,
    watchFiles
);

exports.prod = series(
    prodClean,
    parallel(prodStyles, prodImages, prodScripts, prodHTML),
    buildFinish
);
