"use babel";

import Queue from "../lib/queue/Queue";

describe("Queue", () => {
  let queue;
  let finishCallback, errorCallback;

  beforeEach(() => {
    queue = new Queue(1);
    finishCallback = jasmine.createSpy("finishCallback");
    errorCallback = jasmine.createSpy("errorCallback");
  });

  it("takes a function and executes it", () => {
    let actionCalled = false;

    const func = () => {
      actionCalled = true;

      return Promise.resolve();
    };

    queue.addAction(func);
    queue.execute(finishCallback, errorCallback);

    expect(actionCalled).toBeTruthy();
  });

  it("calls the finish callback when done", () => {
    const action = () => Promise.resolve();

    queue.addAction(action);
    queue.execute(finishCallback, errorCallback);

    expect(finishCallback).toHaveBeenCalled();
  });

  it("calls the error callback when action fails", () => {
    const failingAction = () => Promise.reject("nope");

    runs(() => {
      queue.addAction(failingAction);
      queue.execute(finishCallback, errorCallback);
    });

    waitsFor(() => errorCallback.callCount > 0);
  });
});

