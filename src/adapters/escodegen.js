/**
 * Created with JetBrains WebStorm.
 * User: xaviercambar
 * Date: 18/09/12
 * Time: 22:24
 */

flow.register('escodegen', function (input, info) {
  "use strict";
  return [escodegen.generate(input), info];
});
