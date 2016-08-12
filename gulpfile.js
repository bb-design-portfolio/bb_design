/*global require*/
(function (r) {
    "use strict";

var gulp 					= r('gulp'),
	htmlInjector 		= r('bs-html-injector'),
  plumber 				= r('gulp-plumber'),
  webserver 			= r('gulp-webserver'),
  ngAnnotate 			= r('gulp-ng-annotate'),
  angularFilesort = r('gulp-angular-filesort'),
  sass 						= r('gulp-sass'),
  inject 					= r('gulp-inject'),
  del 						= r('del'),
	imagemin				= r('gulp-imagemin'),
	uglify					=	r('gulp-uglify'),
	concat 					= r('gulp-concat'),
	nodemon					=	r('gulp-nodemon'),
	browserSync 		= r('browser-sync').create();

var paths = {
    build : 'build/',
    buildImgs: 'build/assets/img/',
    buildStyles: 'build/styles/',
    buildApp: 'build/app/',
    buildIndex: 'build/index.html',
		buildVendor: 'build/vendor/',

		index: 'src/index.html',
    markupSrc: 'src/app/**/*.html',
    imgSrc:'src/assets/img/*',
    styleSrc: 'src/styles/**/*.scss',
		vendorFiles: 'src/vendors/*',
    appSrc: ['src/app/*/*.js', '!src/index.html'],
};

gulp.task('default', ['watch', 'copy-fonts', 'browser-sync', 'nodemon']);

// refactor
gulp.task('watch', ['serve'], function () {
    gulp.watch(paths.markupSrc, ['copyFiles']);
    gulp.watch(paths.styleSrc, ['copyFiles']);
    gulp.watch(paths.appSrc, ['copyFiles']);
		gulp.watch(paths.vendorFiles, ['copyFiles']);
    gulp.watch(paths.index, ['copyFiles']);
		gulp.watch(paths.buildIndex, ['copy-index']);
});

gulp.task('serve', ['copyFiles'], function() {
   return gulp.src(paths.build)
    .pipe(webserver({
        livereload: true,
        proxies: [{
            source: '/api',
            target: 'http://localhost:1337'
        }]
    }));
});

gulp.task('copyFiles', function () {

    var appFiles = gulp.src(paths.appSrc)
        .pipe(angularFilesort())
        .pipe(ngAnnotate())
				// .pipe(uglify())
				// .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.buildApp));

    var appStyles = gulp.src(paths.styleSrc)
        .pipe(sass.sync({
            outputStyle: 'compressed',
            errLogToConsole: true
        }))
        .pipe(gulp.dest('build/styles/css'));

    var appImgs = gulp.src(paths.imgSrc)
        .pipe(gulp.dest(paths.buildImgs));

		var appVendors = gulp.src(paths.vendorFiles)
		    .pipe(gulp.dest(paths.buildVendor));

    var appMarkup = gulp.src(paths.markupSrc)
        .pipe(gulp.dest(paths.buildApp));

    return gulp.src(paths.index)
        .pipe(plumber())
        .pipe(gulp.dest(paths.build))
        .pipe(inject(appMarkup, {
            relative: true
        }))
        .pipe(inject(appImgs, {
            relative: true
        }))
				.pipe(inject(appVendors, {
						relative: true,
						name: 'vendorInject'
				}))
        .pipe(inject(appStyles, {
            relative: true,
            name: 'stylesInject'
        }))
        .pipe(inject(appFiles, {
            relative: true
        }))
        .pipe(gulp.dest(paths.build));
});

//COPY FONTS FROM SRC TO BUILD
gulp.task('copy-fonts', function() {
	return gulp.src('./fonts/*')
		.pipe(gulp.dest('./build/assets/fonts/'));
});

//COPY INDEX FROM BUILD TO ROOT FOR GH-PAGES (to be deleted in production)
// gulp.task('copy-index', function() {
// 	return gulp.src('./build/index.html')
// 		.pipe(gulp.dest('./'));
// });

gulp.task('images', function() {
    gulp.src('src/assets/img/*')
        .pipe(imagemin({ progressive: true }))
        .pipe(gulp.dest('build/assets/img'));
});

gulp.task('clean', function () {
    del([paths.build]);
});

gulp.task('browser-sync', ['nodemon'], function() {
	browserSync.init({
	 proxy: "localhost:8000",  // local node app address
	 port: 3000,  // use *different* port than above
	 notify: true
 	});
});

gulp.task('nodemon', function (cb) {
		var callbackCalled = false;
		return nodemon({script: './server.js'}).on('start', function () {
				if (!callbackCalled) {
						callbackCalled = true;
						cb();
				}
		});
});


}(require));
