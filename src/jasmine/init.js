(function() {
  var currentWindowOnload = window.onload;
  delete window.onload;
  window.addEventListener('load', function runJasmine () {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var myReporter = new jasmine.myReporter();
    var trivialReporter = new jasmine.TrivialReporter(document.getElementById('testReport'));

    jasmineEnv.addReporter(trivialReporter);
    jasmineEnv.addReporter(myReporter);

    jasmineEnv.specFilter = function(spec) {
      return myReporter.specFilter(spec);
    };
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    jasmineEnv.execute();
  });
})();