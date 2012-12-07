/**
 * Created with JetBrains WebStorm.
 * User: xaviercambar
 * Date: 17/09/12
 * Time: 19:50
 */

(function (window, doc) {
  "use strict";
  var _satConfig = {};
  _satConfig.onLoadCallbacks = [];

  function _get (script, callback, sync) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', script, arguments.length === 3 ? !sync : true);
    callback = callback || function () {};
    xhr.send();
    if (!sync) {
      xhr.onreadystatechange = callback;
    } else {
      callback.apply(xhr);
    }
  }
  function blocksAnyCall () {
    if (typeof window.onload === 'function') {
      _satConfig.onLoadCallbacks.push(window.onload);
      window.onload = null;
    }
    var satFlows = _satConfig._public.flows;
    _runFlow(satFlows);
    function _runFlow (flow) {
      var _flowKeys = Object.keys(flow);
      var runFlows = 0;
      _flowKeys.forEach(function (scriptName, index, allKeys) {
        _get(scriptName,function () {
          if (this.readyState === 4) {
            _applyFlow(this.responseText, flow[scriptName] || [], scriptName);
          }
          if (++runFlows === _flowKeys.length) {
            _runLoadCallbacks();
          }
        });
      });
    }
    function _runLoadCallbacks () {
      _satConfig.onLoadCallbacks.forEach(function (fn) {
        setTimeout(fn, 1); // So we keep asynchronicity
      });
    }
  }
  window.addEventListener('load', blocksAnyCall);

  _satConfig.flowActions = {
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
      if (_satConfig.flowActions.hasOwnProperty(steps[i])) {
        var resp = _satConfig.flowActions[steps[i]].call(window, stage, info);
        stage = resp[0];
        info = resp[1];
      } else if (steps[i]) {
        throw new Error('Unknown step ' + steps[i]);
      }
    }
    return stage;
  }

  function _register (name, fn) {
    _satConfig.flowActions[name] = fn;
  }

  function onLoadWrapper (eventType, callback, useCapture) {
    if (eventType === 'load') {
      _satConfig.onLoadCallbacks.push(callback);
    }
    return this;
  };

  if (!window.sat) {
    window.addEventListener("sat:override", function (evt) {
      evt.passConfig(_satConfig);
    }, false);
  } else {
    var evt = document.createEvent("Events");
    evt.initEvent('sat:override', true, true);
    evt.applyFlow = _applyFlow;
    evt.passConfig = function (config) {
      var cbIndex = config.onLoadCallbacks.indexOf(blocksAnyCall);
      if (cbIndex !== -1) {
        config.onLoadCallbacks.splice(cbIndex, 1);
      }
      _satConfig = config;
      window.addEventListener = onLoadWrapper;
    };
    document.dispatchEvent(evt);
  }

  function _addScript (steps) {
    steps.forEach(function (value) {
      var head = document.head;
      var _script = document.createElement('script');
      _script.setAttribute('type', 'text/javascript');
      _script.setAttribute('src', value);
      head.appendChild(_script);
    });
  }

  function _normalizeURL (key, v) {
    if (key === 'adapters') {
      return [_satConfig._public.baseUrl || '', 'src/adapters', v + '.js'].join('/');
    }
    return v;
  }

  window.addEventListener = onLoadWrapper;
  window.sat = _applyFlow;
  window.sat.register =  _register;

  //Utilities
  window.sat.adapters = function () {
    return Object.keys(_satConfig.flowActions);
  };
  window.sat.conf = function (conf) {
    _satConfig._public = _satConfig._public || {};
    if (typeof conf === 'string') {
      _get(conf, function () {
        _executeConf(JSON.parse(this.responseText));
      }, true);
    } else {
      _executeConf(conf);
    }
    function _executeConf (conf) {
      Object.keys(conf).forEach(function (key) {
        if (['adapters', 'externals'].indexOf(key) !== -1) {
          _addScript(conf[key].map(_normalizeURL.bind([], key)));
        }
        Object.defineProperty(_satConfig._public, key, {
          value: conf[key],
          writable: false
        });
      });
    }
  };
})(window, document);
