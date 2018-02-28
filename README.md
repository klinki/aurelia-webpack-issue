# aurelia-webpack-issue
This repository demonstrates problem to get aurelia working with webpack.

When running `au run --watch` following exception is thrown in runtime:

```
css-resource.js?ada4:17 Uncaught (in promise) Error: Failed loading required CSS file: aurelia-notify/style.css
    at fixupCSSUrls (css-resource.js?ada4:17)
    at eval (css-resource.js?ada4:56)
    at <anonymous>
```

But this exception occurs only when any of following libraries is included. 
```
  <require from="aurelia-bootstrap-datetimepicker/src/bootstrap-datetimepicker-bs4.css"></require>
  <require from="eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css"></require>
```

(Please note error message is completely unrelated to these libraries).


But webpack configuration doesn't seem to be completely wrong, because in tag `working-state` it works. 
