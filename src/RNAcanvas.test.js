/**
 * @jest-environment jsdom
 */

import { RNAcanvas } from './RNAcanvas';

if (!SVGElement.prototype.viewBox) {
  SVGElement.prototype.viewBox = { baseVal: { width: 0, height: 0 } };
}

if (!SVGElement.prototype.width) {
  SVGElement.prototype.width = { baseVal: { value: 0 } };
}

if (!SVGElement.prototype.height) {
  SVGElement.prototype.height = { baseVal: { value: 0 } };
}

if (!SVGElement.prototype.getBBox) {
  SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 });
}

if (!SVGElement.prototype.getTotalLength) {
  SVGElement.prototype.getTotalLength = () => 0;
}

if (!SVGElement.prototype.getPointAtLength) {
  SVGElement.prototype.getPointAtLength = () => ({ x: 0, y: 0 });
}

['x1', 'y1', 'x2', 'y2'].forEach(coordinateName => {
  if (!SVGElement.prototype[coordinateName]) {
    Object.defineProperty(SVGElement.prototype, coordinateName, {
      value: { baseVal: { value: 0 } },
      writable: true,
    });
  }
});

expect(globalThis.SVGTextElement).toBeFalsy();
globalThis.SVGTextElement = SVGElement;

expect(globalThis.SVGCircleElement).toBeFalsy();
globalThis.SVGCircleElement = SVGElement;

expect(globalThis.SVGLineElement).toBeFalsy();
globalThis.SVGLineElement = SVGElement;

describe('RNAcanvas class', () => {
  test('appendTo method', () => {
    let rnaCanvas = new RNAcanvas();
    let container = document.createElement('div');

    // add some elements to append after
    container.appendChild(document.createElement('div'));
    container.appendChild(document.createElement('div'));
    container.appendChild(document.createElement('div'));
    container.appendChild(document.createElement('div'));

    expect(container.contains(rnaCanvas.domNode)).toBeFalsy();
    rnaCanvas.appendTo(container);
    expect(container.childNodes[4]).toBe(rnaCanvas.domNode);
  });

  test('remove method', () => {
    let rnaCanvas = new RNAcanvas();

    let container = document.createElement('div');
    rnaCanvas.appendTo(container);

    expect(container.contains(rnaCanvas.domNode)).toBeTruthy();
    rnaCanvas.remove();
    expect(container.contains(rnaCanvas.domNode)).toBeFalsy();
  });

  test('style getter', () => {
    let rnaCanvas = new RNAcanvas();

    expect(rnaCanvas.style).toBe(rnaCanvas.domNode.style);
    expect(rnaCanvas.domNode.style).toBeTruthy();
  });

  test('`serialized()`', () => {
    let app = new RNAcanvas();

    // add some contents to the drawing
    app.drawing.addBase('G');
    app.drawing.addBase('A');
    app.drawing.addBase('C');

    expect(app.drawing.serialized()).toBeTruthy();
    expect(app.drawing.serialized()).not.toEqual({});

    expect(app.drawingView.serialized()).toBeTruthy();
    expect(app.drawingView.serialized()).not.toEqual({});

    expect(app.serialized().drawing).toStrictEqual(app.drawing.serialized());
    expect(app.serialized().drawingView).toStrictEqual(app.drawingView.serialized());
  });

  test('`restore()`', () => {
    let app = new RNAcanvas();

    // add some contents to the drawing
    for (let i = 0; i < 10; i++) { app.drawing.addBase(`${i}`); }

    let previousState = app.serialized();

    // change the drawing
    [...app.drawing.bases][3].remove();

    expect(app.serialized()).not.toStrictEqual(previousState);

    app.restore(previousState);
    expect(app.serialized()).toStrictEqual(previousState);

    // make invalid
    let invalidState = app.serialized();
    invalidState.drawing.bases[2].id = '';

    expect(() => app.restore(invalidState)).toThrow();

    // app state was not changed
    expect(app.serialized()).toStrictEqual(previousState);
    expect(app.serialized()).not.toStrictEqual(invalidState);
  });

  test('`pushUndoStack()`', () => {
    let app = new RNAcanvas();
    expect(app.canUndo()).toBeFalsy();

    app.pushUndoStack();
    expect(app.canUndo()).toBeTruthy();

    app.undo();
    expect(app.canUndo()).toBeFalsy();

    // make the drawing unserializable
    for (let i = 0; i < 3; i++) { app.drawing.addBase('A'); }
    [...app.drawing.bases][1].domNode.id = '';

    expect(() => app.pushUndoStack()).toThrow();

    // nothing got pushed onto the undo stack
    expect(app.canUndo()).toBeFalsy();
  });

  test('`canUndo()`', () => {
    let app = new RNAcanvas();
    expect(app.canUndo()).toBe(false);

    app.pushUndoStack();
    expect(app.canUndo()).toBe(true);

    app.undo();
    expect(app.canUndo()).toBe(false);
  });

  test('`undo()`', () => {
    let app = new RNAcanvas();

    // make the drawing unique
    [...'auchuagfieufiw'].forEach(c => app.drawing.addBase(c));

    let state1 = app.serialized();
    app.pushUndoStack();

    // edit the drawing again
    [...'71263871'].forEach(c => app.drawing.addBase(c));

    let state2 = app.serialized();
    expect(state2).not.toEqual(state1);

    app.undo();
    expect(app.serialized()).toStrictEqual(state1);

    // undoing should push the redo stack
    app.redo();
    expect(app.serialized()).toStrictEqual(state2);

    // empty the undo stack
    app.undo();
    expect(() => app.undo()).toThrow();
  });

  test('`get undoStack()`', () => {
    let app = new RNAcanvas();
    expect(app.undoStack.isEmpty()).toBe(true);

    let listeners = [1, 2, 3].map(() => jest.fn());
    listeners.forEach(li => app.undoStack.addEventListener('change', li));

    app.pushUndoStack();

    expect(app.undoStack.isEmpty()).toBe(false);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(1));

    // edit the drawing
    [...'agcuagcuagc'].forEach(c => app.drawing.addBase(c));

    app.undo();

    expect(app.undoStack.isEmpty()).toBe(true);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(2));

    app.redo();

    expect(app.undoStack.isEmpty()).toBe(false);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(3));

    // should not call listeners anymore
    listeners.forEach(li => app.undoStack.removeEventListener('change', li));

    app.undo();

    expect(app.undoStack.isEmpty()).toBe(true);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(3));
  });

  test('`canRedo()`', () => {
    let app = new RNAcanvas();
    expect(app.canRedo()).toBe(false);

    app.pushUndoStack();
    expect(app.canRedo()).toBe(false);

    app.undo();
    expect(app.canRedo()).toBe(true);

    app.redo();
    expect(app.canRedo()).toBe(false);
  });

  test('`redo()`', () => {
    let app = new RNAcanvas();

    // make the drawing unique
    [...'acguahaisuhdfiuhwef'].forEach(c => app.drawing.addBase(c));

    let state1 = app.serialized();
    app.pushUndoStack();

    // edit the drawing again
    [...'AGCUGAUCC'].forEach(c => app.drawing.addBase(c));

    let state2 = app.serialized();
    expect(state2).not.toEqual(state1);

    app.undo();
    expect(app.serialized()).toStrictEqual(state1);

    app.redo();
    expect(app.serialized()).toStrictEqual(state2);

    // redoing should push the undo stack
    app.undo();
    expect(app.serialized()).toStrictEqual(state1);

    // empty the redo stack
    app.redo();
    expect(() => app.redo()).toThrow();
  });

  test('`get redoStack()`', () => {
    let app = new RNAcanvas();
    expect(app.redoStack.isEmpty()).toBe(true);

    let listeners = [1, 2, 3].map(() => jest.fn());
    listeners.forEach(li => app.redoStack.addEventListener('change', li));

    app.pushUndoStack();

    expect(app.redoStack.isEmpty()).toBe(true);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(0));

    // edit the drawing
    [...'agcuagcuagc'].forEach(c => app.drawing.addBase(c));

    app.undo();

    expect(app.redoStack.isEmpty()).toBe(false);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(1));

    app.redo();

    expect(app.redoStack.isEmpty()).toBe(true);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(2));

    // should not call listeners anymore
    listeners.forEach(li => app.redoStack.removeEventListener('change', li));

    app.undo();

    expect(app.redoStack.isEmpty()).toBe(false);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(2));
  });
});
