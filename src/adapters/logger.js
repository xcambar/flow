/**
 * Created with JetBrains WebStorm.
 * User: xaviercambar
 * Date: 18/09/12
 * Time: 22:24
 */

sat.register('logger', function (input, info) {
  "use strict";
  console.log(input);
  return [input, info];
});
