(function() {
  var currentWindowOnload = window.onload;
  delete window.onload;
  window.addEventListener('load', function runJasmine () {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var trivialReporter = new jasmine.TrivialReporter(document.getElementById('testReport'));

    jasmineEnv.addReporter(trivialReporter);

    jasmineEnv.specFilter = function(spec) {
      return trivialReporter.specFilter(spec);
    };
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    jasmineEnv.execute();
  });
})();
