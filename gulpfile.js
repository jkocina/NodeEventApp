// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const gulp = require("gulp");
const header = require("gulp-header");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const pkg = require('./package.json');

const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish-summary')

const inject = require('gulp-inject');
const uglify = require('gulp-uglify');
const nodemon = require('gulp-nodemon');


// Set the banner content
const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function(cb) {

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./public/vendor/bootstrap'))

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./public/vendor/jquery'))
  
  // ionic icons
    gulp.src([
      './node_modules/ionicons/dist/css/*'
    ])
    .pipe(gulp.dest('./public/vendor/ionicons'))
    
    //jquery modal 
    gulp.src([
      './node_modules/jquery-modal/jquery*'
    ])
    .pipe(gulp.dest('./public/vendor/jquery-modal'))
  
  cb();

});

// CSS task
function css() {
  return gulp
    .src("./scss/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded"
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(browsersync.stream());
}

// Tasks
gulp.task("css", css);

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    }
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch("./**/*.html", browserSyncReload);
}

gulp.task("default", gulp.parallel('vendor', css));

// dev task
gulp.task("dev", gulp.parallel(watchFiles, browserSync));


gulp.task('index' , function(){
  //This is whats being injected into 
  var target = gulp.src('./src/views/index.ejs');
  
  //These are the sources to inject from. For this command, root is the directory the gulp file is in.
  var sources = gulp.src(['./public/vendor/**/*.js', './public/**/*.css']);
  var customSources = gulp.src(['./public/js/index/*.js']);
  var modalSources = gulp.src(['./public/vendor/jquery-modal/*']);
  
  //these are options for inject
  var coreOptions = {
    ignorePath: '/public'
  };
  
  //this includes a tag to inject at a custom location
  var customOptions = {
    ignorePath: '/public',
    starttag: '<!-- inject:custom:{{ext}} -->'
  }
  
  //Modal Options
  var modalOptions = {
    ignorePath: '/public',
    starttag: '<!-- inject:modal:{{ext}} -->'
  }
  
  /*
    Piping into the target from inject sources. The inject method must have 
    the programming to inject at the target placeholders
  */
  return target.pipe(inject(sources, coreOptions))
    .pipe(inject(customSources, customOptions))
    .pipe(inject(modalSources, modalOptions))
    .pipe(gulp.dest('./src/views'));
});

/*
  This function will check the style of the js files using jshint
*/

var jsFiles =['./public/js/**/*.js'];

// This method will check the syntax of the custom js files
gulp.task('style', function(){
  
  return gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// run style, index and app.js. Allows cmd line restart with rsG
gulp.task('serve', gulp.series('style','index', function() {
  
  var options={
    script: 'app.js',
    delayTime: 1,
    watch: jsFiles
  };  
  return nodemon(options)
    .on('restart', function(ev){
      console.log('Restarting Server...');
    });
}));
