/**
 * Inspired (if not roughly copied/pasted) by https://github.com/arian/CoverJS/blob/master/lib/Instrument.js
 * Created with JetBrains WebStorm.
 * User: xaviercambar
 * Date: 19/09/12
 * Time: 00:08
 */


(function () {
  "use strict";

  var id = 0;
  var Instrument = function (parsedCode, info) {

    var name = info.name;
    if (!name) name = (id++).toString(36);
    this.ast = parsedCode;
    this.code = info.code;
    this.name = name;

    var quotedName = this.quotedName = JSON.stringify(this.name);
    var quotedCode = this.quotedCode = this.code;

    this.ranges = [];

    this.headCode = [
      {"type":"IfStatement", "test":{"type":"BinaryExpression", "operator":"===", "left":{"type":"UnaryExpression", "operator":"typeof", "argument":{"type":"Identifier", "name":"__$coverObject"}}, "right":{"type":"Literal", "value":"undefined"}}, "consequent":{"type":"BlockStatement", "body":[
        {"type":"ExpressionStatement", "expression":{"type":"AssignmentExpression", "operator":"=", "left":{"type":"MemberExpression", "computed":false, "object":{"type":"Identifier", "name":"window"}, "property":{"type":"Identifier", "name":"__$coverObject"}}, "right":{"type":"ObjectExpression", "properties":[]}}}
      ]}, "alternate":null},
      {"type":"ExpressionStatement", "expression":{"type":"AssignmentExpression", "operator":"=", "left":{"type":"MemberExpression", "computed":true, "object":{"type":"Identifier", "name":"__$coverObject"}, "property":{"type":"Identifier", "name":quotedName}}, "right":{"type":"ObjectExpression", "properties":[]}}},
      {"type":"ExpressionStatement", "expression":{"type":"AssignmentExpression", "operator":"=", "left":{"type":"MemberExpression", "computed":false, "object":{"type":"MemberExpression", "computed":true, "object":{"type":"Identifier", "name":"__$coverObject"}, "property":{"type":"Identifier", "name":quotedName}}, "property":{"type":"Identifier", "name":"__code"}}, "right":{"type":"Literal", "value":this.quotedCode}}}
    ];
    this.rangesCode = [];
  };

  Instrument.prototype = {

    // Short method to instrument the code

    instrument:function () {
      this.walk();
      return this.generate();
    },

    // generate new instrumented code from AST

    generate:function () {
      this._generateInitialRanges();
      this.ast.body = this.rangesCode.concat(this.ast.body);
      this.ast.body = this.headCode.concat(this.ast.body);
      return this.ast;
    },

    _generateInitialRanges:function () {
      for (var i = 0, l = this.ranges.length; i < l; i++) {
        var range = this.ranges[i];
        this.rangesCode.push({"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":true,"object":{"type":"MemberExpression","computed":true,"object":{"type":"Identifier","name":"__$coverObject"},"property":{"type":"Identifier","name":this.quotedName}},"property":{"type":"Literal","value":range[0]+":"+range[1]}},"right":{"type":"Literal","value":0}}});
      }
    },

    // Modify AST by injecting extra instrumenting code

    walk:function () {
      this._walk(this.ast);
      return this.ast;
    },

    _walk:function (ast, index, parent) {

      // iterator variables
      var i, l, k;

      switch (index) {
        case 'body':
        case 'consequent':
          if (Array.isArray(ast)) {
            for (i = 0, l = ast.length; i < l; i++) {
              var range = ast[i * 2].range;
              ast.splice(i * 2, 0, this._statementCallAST(range));
              this.ranges.push(range);
            }
          }
          break;
      }

      // recurse through the AST

      if (Array.isArray(ast)) {

        for (i = 0, l = ast.length; i < l; i++) this._walk(ast[i], i, parent);

      } else if (typeof ast === 'object') {

        for (k in ast) this._walk(ast[k], k, parent);

      }

    },

    _statementCallAST:function (range) {

      return {
        "type":"ExpressionStatement",
        "expression":{
          "type":"UpdateExpression",
          "operator":"++",
          "argument":{
            "type":"MemberExpression",
            "computed":true,
            "object":{
              "type":"MemberExpression",
              "computed":true,
              "object":{
                "type":"Identifier",
                "name":"__$coverObject"
              },
              "property":{
                "type":"Literal",
                "value":this.name
              }
            },
            "property":{
              "type":"Literal",
              "value":range[0] + ":" + range[1]
            }
          },
          "prefix":false
        }
      };

    }

  };

  sat.register('coverage', function (input, info) {
    var instrument = new Instrument(input, info);
    return [instrument.instrument(), info];
  });
})();
