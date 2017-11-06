import gulp from 'gulp';
import plumber from 'gulp-plumber';
import bs from 'browser-sync';
import config from '../config';


gulp.task( 'data', ()=> {
  return gulp.src( './src/data/*' )
    .pipe(plumber())
    .pipe( gulp.dest( `${config.build}/data` ) )
    .pipe( bs.stream() );
} );
