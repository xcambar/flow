describe('Data flow runner', function () {
  "use strict";
  it('does not run code with no data flow specified', function () { //@see test/fixtures/noFlow.js
    expect(window.testVar).toBeUndefined();
  });
  it('runs the code with a data flow containing a single run step', function () { //@see test/fixtures/runFlow.js
    expect(window.isRun).toEqual('I\'ve been run');
  })
  it ('runs all the steps', function () {
    expect(window.threeTimes).toEqual(3);
  });
});

