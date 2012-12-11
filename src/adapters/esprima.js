/**
 * Created with JetBrains WebStorm.
 * User: xaviercambar
 * Date: 18/09/12
 * Time: 22:24
 */

flow.register('esprima', function (input, info) {
  "use strict";
  return [esprima.parse(input, {range: true}), info];
});
