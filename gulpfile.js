let preprocessor = 'sass';
const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify').default;
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagecomp = require('compress-images');
const del = require('del');

function browsersync() {
	browserSync.init({
		server: { baseDir: 'source' },
		notify: false,
		online: false
	})
}

function styles() {
	return src('source/sass/style.scss')
	.pipe(eval(preprocessor)())
	.pipe(concat('style.min.css'))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	.pipe(cleancss( { level: { 1: { specialComments: 0 } } , format: 'beautify' } ))
	.pipe(dest('source/css/'))
	.pipe(browserSync.stream())
}

async function images() {
	imagecomp(
		"source/img/**/*",
		"build/img/",
		{ compress_force: false, statistic: true, autoupdate: true }, false,
		{ jpg: { engine: "mozjpeg", command: ["-quality", "80"] } },
		{ png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) {
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}

function cleanimg() {
	return del('source/img/dest/**/*', { force: true })
}

function buildcopy() {
	return src([
		'source/css/**/*.min.css',
		'source/js/**/*.js',
		'source/**/*.html',
		], { base: 'source' })
	.pipe(dest('build'))
}

function cleandist() {
	return del('build/**/*', { force: true })
}

function startwatch() {

	watch('source/**/' + preprocessor + '/**/*', styles);

	watch('source/**/*.html').on('change', browserSync.reload);

	watch('source/img/**/*', images);
}

exports.browsersync = browsersync;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;

exports.build = series(cleandist, styles, images, buildcopy);

exports.default = parallel(styles, browsersync, startwatch);

