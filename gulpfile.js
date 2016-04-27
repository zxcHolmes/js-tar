'use strict';

var fs = require('fs');
var gulp = require('gulp');
var del = require('del');
var replace = require('gulp-replace');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('clean', (callback) => del(['./dist/*'], callback));

gulp.task('cleanAfterBuild', (callback) => del(['./dist/temp/'], callback));

gulp.task('mergeClass', () => {
  return gulp.src([
    './src/ByteHelper.js',
    './src/ByteStreamLittleEndian.js',
    './src/FileHelper.js',
    './src/OctalHelper.js',
    './src/TarFileTypeFlag.js',
    './src/TarFileEntryHeader.js',
    './src/TarFileEntry.js',
    './src/TarFile.js'
  ])
    .pipe(concat('temp.js', { newLine: '\n' }))
    .pipe(gulp.dest('./dist/temp/'));
});

gulp.task('build', () => {
  return gulp.src('./src/js-tar.js')
    .pipe(replace('/*GULP_REPLACE_HOLDER_FOR_TAR*/', fs.readFileSync('./dist/temp/temp.js', 'utf8').toString()))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('uglify', () => {
  return gulp.src('./dist/js-tar.js')
  .pipe(uglify())
  .pipe(concat('js-tar.min.js'))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('default', gulp.series('clean', 'mergeClass', 'build', 'uglify', 'cleanAfterBuild'));