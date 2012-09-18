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
      var name = scriptNode.getAttribute('src');
      xhr.open('GET', name, true);
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          remainingScripts--;
          _runFlow(this.responseText, (scriptNode.getAttribute('data-flow') || '').split(','), name);
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
    'run': function (input, info) {
      var codeFn = new Function(input);
      codeFn.call(this);
      return [input, info];
    },
    'scriptRun': function (input, info) {
      var _scriptElt = document.createElement('script');
      _scriptElt.setAttribute('type', 'text/javascript');
      _scriptElt.appendChild(document.createTextNode(input));
      document.body.appendChild(_scriptElt);
      var codeFn = new Function(input);
      codeFn.call(this);
      return [input, info];
    }
  };
  function _runFlow (code, steps, name) {
    var stage = code;
    var info = {name: name, code: code};
    for (var i = 0; i < steps.length; i++) {
      if (_flowSteps.hasOwnProperty(steps[i])) {
        var resp = _flowSteps[steps[i]].call(window, stage, info);
        stage = resp[0];
        info = resp[1];
      } else if (steps[i]) {
        throw new Error('Unknown step ' + steps[i]);
      }
    }
    return stage;
  }

  function _register (name, fn) {
    _flowSteps[name] = fn;
  }

  window.sat = _runFlow;
  window.sat.register =  _register;
  window.sat.adapters = function () {
    return Object.keys(_flowSteps);
  }
})(window, document);