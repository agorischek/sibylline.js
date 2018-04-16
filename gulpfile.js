var gulp = require("gulp");
var rename = require("gulp-rename");

gulp.task("build", function(){
  return gulp.src("src/main.js")
    .pipe(rename("sibylline.js"))
    .pipe(gulp.dest("./"))
});

gulp.task("default", ["build"]);
