/**
 * Created with JetBrains WebStorm.
 * User: xaviercambar
 * Date: 17/09/12
 * Time: 19:50
 */

(function (window, doc) {
  "use strict";
  var _onLoadCallbacks = [];
  window.addEventListener('load', function blocksAnyCall () {
    if (typeof window.onload === 'function') {
      _onLoadCallbacks.push(window.onload);
      window.onload = null;
    }
    var satScripts = doc.querySelectorAll('sat-script');
    var remainingScripts = satScripts.length;
    Array.prototype.slice.call(satScripts).forEach(function (scriptNode) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', scriptNode.getAttribute('src'), true);
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          remainingScripts--;
          _runFlow(this.responseText, (scriptNode.getAttribute('data-flow') || '').split(','));
        }
        if (!remainingScripts) {
          _runLoadCallbacks();
        }
      };
      xhr.send();
    });

    function _runLoadCallbacks () {
      _onLoadCallbacks.forEach(function (fn) {
        setTimeout(fn, 1); // So we keep asynchronicity
      });
    }
  });

  window.addEventListener = function onLoadWrapper (eventType, callback, useCapture) {
    if (eventType === 'load') {
      _onLoadCallbacks.push(callback);
    }
    return this;
  };


  var _flowSteps = {
    'run': function (code) {
      var code = new Function(code);
      code.call(this);
    }
  };
  function _runFlow (code, steps) {
    var stage = code;
    for (var i = 0; i < steps.length; i++) {
      if (_flowSteps.hasOwnProperty(steps[i])) {
        stage = _flowSteps[steps[i]].call(window, code);
      } else if (steps[i]) {
        throw new Error('Unknown step ' + steps[i]);
      }
    }
  }
})(window, document);