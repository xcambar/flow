/*global expect: true, esprima: true, it:true, expect:true, jasmine: true, flow: true, window: true */
describe('Data flow runner', function () {
  "use strict";
  it('does not run code with no data flow specified', function () { //@see test/fixtures/noFlow.js
    expect(window.testVar).toBeUndefined();
  });
  it('runs the code with a data flow containing a single run step', function () { //@see test/fixtures/runFlow.js
    expect(window.isRun).toEqual('I\'ve been run');
  });
  it ('runs all the steps', function () {
    expect(window.threeTimes).toEqual(3);
  });
});

describe('Adapters', function () {
  "use strict";
  var spy = jasmine.createSpy();
  it ('allows to register adapters programmatically', function () {
    flow.register('dummy', function () { spy(); return ['', {}];});
    expect(flow.adapters().indexOf('dummy')).not.toEqual(-1);
  });
  it('can run the specified adapters', function () {
    flow('any code or data', ['dummy']);
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.length).toEqual(1);
    spy.reset();
    flow('any code or data', ['dummy', 'dummy', 'dummy']);
    expect(spy.calls.length).toEqual(3);
  });
  it ('registers adapters defined in the <head> tag', function () {
    var code = 'var answer = 42';
    var resp = flow(code, ['esprima']); //Registered through an adapter
    expect(resp).toEqual(esprima.parse(code, {range: true}));
  });
  it ('tries to parse and rebuild code through default adapters', function () {
    var code = 'var answer=42';
    var resp = flow(code, ['esprima', 'coverage', 'escodegen', 'scriptRun']);
    expect(window.answer).toEqual(42);
    //Add tests after adding the changes in the API (auto info -> Remove params, set as object property)
  });
});
