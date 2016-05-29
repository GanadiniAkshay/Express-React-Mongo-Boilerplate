var gulp        = require('gulp');
var args        = require('yargs').argv;
var browserSync = require('browser-sync');
var browserify  = require('browserify');
var reactify    = require('reactify');
var source = require('vinyl-source-stream');

var $           = require('gulp-load-plugins')({ lazy:true });

// Analyze all javascript files in the server folder for style and correctness using jshint and jscs
gulp.task('vet-server', function () {
  log('Analyzing Server Js Files Using JSHint and JSCS');

  return gulp.src('./server/*.js')
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
              verbose: true,
            }))
            .pipe($.jshint.reporter('fail'))
            .pipe($.jscs({ fix:true }))
            .pipe($.jscs.reporter())
            .pipe(gulp.dest('./server'));
});

// Analyze all javascript files in the public/js folder for
// style and correctness using jshint and jscs
gulp.task('vet-public', function () {
  log('Analyzing Public Js Files Using JSHint and JSCS');

  return gulp.src('./public/js/*.js')
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
              verbose: true,
            }))
            .pipe($.jshint.reporter('fail'))
            .pipe($.jscs({ fix:true }))
            .pipe($.jscs.reporter())
            .pipe(gulp.dest('./public/js'));
});

// Analyze all javascript files in the app/components for
// style and correctness using jshint and jscs
gulp.task('vet-app-components', function () {
  log('Analyzing React Components Using JSHint and JSCS');

  return gulp.src('./app/components/*.js')
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
              verbose: true,
            }))
            .pipe($.jshint.reporter('fail'))
            .pipe($.jscs({ fix:true }))
            .pipe($.jscs.reporter())
            .pipe(gulp.dest('./app/components'));
});

// Analyze all javascript files in the app/actions for
// style and correctness using jshint and jscs
gulp.task('vet-app-actions', function () {
  log('Analyzing React Actions Using JSHint and JSCS');

  return gulp.src('./app/actions/*.js')
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
              verbose: true,
            }))
            .pipe($.jshint.reporter('fail'))
            .pipe($.jscs({ fix:true }))
            .pipe($.jscs.reporter())
            .pipe(gulp.dest('./app/actions'));
});

// Analyze all javascript files in the app/stores for
// style and correctness using jshint and jscs
gulp.task('vet-app-stores', function () {
  log('Analyzing React Stores Using JSHint and JSCS');

  return gulp.src('./app/stores/*.js')
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
              verbose: true,
            }))
            .pipe($.jshint.reporter('fail'))
            .pipe($.jscs({ fix:true }))
            .pipe($.jscs.reporter())
            .pipe(gulp.dest('./app/stores'));
});

// Analyze  main.jsx files in the app folder for
// style and correctness using jshint and jscs
gulp.task('vet-app', function () {
  log('Analyzing main.jsx Using JSHint and JSCS');

  return gulp.src('./app/main.jsx')
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
              verbose: true,
            }))
            .pipe($.jshint.reporter('fail'))
            .pipe($.jscs({ fix:true }))
            .pipe($.jscs.reporter())
            .pipe(gulp.dest('./app'));
});

// Analyze all javascript files in the root folder for
// style and correctness using jshint and jscs
gulp.task('vet', ['vet-server', 'vet-public', 'vet-app-components',
                  'vet-app-actions', 'vet-app-stores', 'vet-app',], function () {
  log('Analyzing Root Js Files Using JSHint and JSCS');

  return gulp.src('./*.js')
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
              verbose: true,
            }))
            .pipe($.jshint.reporter('fail'))
            .pipe($.jscs({ fix:true }))
            .pipe($.jscs.reporter())
            .pipe(gulp.dest('.'));
});

// Transform JSX into JS and load into .tmp folder in public
gulp.task('bundle', function () {
  log('Transforming JSX into JS');

  return browserify({
    entries:'./app/main.jsx',
    debug:true,
  })
  .transform(reactify)
  .bundle()
  .pipe(source('app.js'))
  .pipe(gulp.dest('./public/.tmp'));
});

// Automatically Inject CSS and JS Files using wiredep and gulp-inject
gulp.task('wiredep', function () {
  log('Injecting CSS and JS tags into HTML files');

  var wiredep = require('wiredep').stream;
  var inject = require('gulp-inject');

  var injectSrc = gulp.src(['./public/css/*.css', './public/js/*.js', './public/.tmp/*.js'], { read:false });
  var injectOptions = {
     ignorePath: '/public',
   };

  var options = {
     bowerJson: require('./bower.json'),
     directory: './public/lib',
     ignorePath: '../../public',
   };

  return gulp.src('./server/views/*.html')
             .pipe(wiredep(options))
             .pipe(inject(injectSrc, injectOptions))
             .pipe(gulp.dest('./server/views'));
});

// Automatically restart server on change to any JS Files and run vet on restart
gulp.task('serve-dev', ['wiredep'], function () {
  var isDev = true;

  var nodeOptions = {
    script:'./server/server.js',
    delayTime:1,
    env:{
      PORT:process.env.PORT || 8000,
      NodeEnv:isDev ? 'dev' : 'build',
    },
    watch:[
            __dirname + '/server/*.js',
            __dirname + '/public/js/*.js',
            __dirname + '/*.js',
            __dirname + '/app/**/*.js',
            __dirname + '/app/main.jsx',
          ],
  };

  return $.nodemon(nodeOptions)
          .on('restart', function (env) {
            log('*** nodemon restarted ***');
            log('files changed: ' + env);
            setTimeout(function () {
              browserSync.notify('Reloading browserSync...');
              browserSync.reload({ stream:false });
            }, 2000);
          })
          .on('start', function () {
            log('*** nodemon started ***');
            startBrowserSync();
          })
          .on('crash', function () {
            log('*** nodemon crashed: script crashed for some reason ***');
          })
          .on('exit', function () {
            log('*** nodemon exited cleanly ***');
          });
});

//////////////////////////
// Custom Functions
/////////////////////////

function startBrowserSync() {
  if (browserSync.active) {
    return;
  }

  log('Starting BrowserSync on Port ' + '3000');

  var options = {
    proxy:'localhost:5000',
    port:3000,
    files:[
      __dirname + '/public/**/*.*',
      __dirname + '/server/views/*.html',
    ],
    ghostMode:{
      clicks:true,
      location:false,
      forms:true,
      scroll:true,
    },
    injectChanges:true,
    logFileChanges:true,
    logLevel:'debug',
    logPrefix:'gulp-patterns',
    notify:true,
    reloadDelay:1000,
  };

  browserSync(options);
}

function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}
