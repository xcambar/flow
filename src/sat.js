/**
 * Created with JetBrains WebStorm.
 * User: xaviercambar
 * Date: 17/09/12
 * Time: 19:50
 */

(function (window, doc) {
  "use strict";
  var _onLoadCallbacks = [];

  function blocksAnyCall () {
    if (typeof window.onload === 'function') {
      _onLoadCallbacks.push(window.onload);
      window.onload = null;
    }
    var satFlows = Array.prototype.slice.call(doc.querySelectorAll('sat-flow'));
    _runNextFlow();
    function _runNextFlow () {
      var next = satFlows.shift();
      if (next) {
        _runFlow(next);
      } else {
        _runLoadCallbacks();
      }
    }
    function _runFlow (flow) {
      var flowSteps = Array.prototype.slice.call(flow.children);
      var runFlows = 0;
      flowSteps.forEach(function (scriptNode, index, all) {
        var totalLength = all.length;
        var xhr = new XMLHttpRequest();
        var name = scriptNode.getAttribute('src');
        xhr.open('GET', name, true);
        xhr.onreadystatechange = function () {
          if (this.readyState === 4) {
            _applyFlow(this.responseText, (scriptNode.getAttribute('data-steps') || '').split(','), name);
          }
          if (++runFlows === flowSteps.length) {
            _runNextFlow();
          }
        };
        xhr.send();
      });
    }
    function _runLoadCallbacks () {
      _onLoadCallbacks.forEach(function (fn) {
        setTimeout(fn, 1); // So we keep asynchronicity
      });
    }
  }
  window.addEventListener('load', blocksAnyCall);

  var _flowActions = {
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
      return [input, info];
    }
  };
  function _applyFlow (code, steps, name) {
    var stage = code;
    var info = {name: name, code: code};
    for (var i = 0; i < steps.length; i++) {
      if (_flowActions.hasOwnProperty(steps[i])) {
        var resp = _flowActions[steps[i]].call(window, stage, info);
        stage = resp[0];
        info = resp[1];
      } else if (steps[i]) {
        throw new Error('Unknown step ' + steps[i]);
      }
    }
    return stage;
  }

  function _register (name, fn) {
    _flowActions[name] = fn;
  }

  function onLoadWrapper (eventType, callback, useCapture) {
    if (eventType === 'load') {
      _onLoadCallbacks.push(callback);
    }
    return this;
  };

  if (!window.sat) {
    window.addEventListener("sat:override", function (evt) {
      evt.passCallbacks(_onLoadCallbacks, _flowActions);
      _applyFlow = evt.applyFlow;
    }, false);
  } else {
    var evt = document.createEvent("Events");
    evt.initEvent('sat:override', true, true);
    evt.applyFlow = _applyFlow;
    evt.passCallbacks = function (_loadCBs, _flow) {
      _onLoadCallbacks = _loadCBs;
      var cbIndex = _onLoadCallbacks.indexOf(blocksAnyCall);
      if (cbIndex !== -1) {
        _onLoadCallbacks.splice(cbIndex, 1);
      }
      _flowActions = _flow;
      window.addEventListener = onLoadWrapper;
    };
    document.dispatchEvent(evt);
  }

  window.addEventListener = onLoadWrapper;
  window.sat = _applyFlow;
  window.sat.register =  _register;
  window.sat.adapters = function () {
    return Object.keys(_flowActions);
  }
})(window, document);