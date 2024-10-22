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

    let serializedDrawing = app.drawing.serialized();
    expect(serializedDrawing).toBeTruthy();
    expect(serializedDrawing).not.toStrictEqual({});

    expect(app.serialized()).toStrictEqual({ drawing: serializedDrawing });
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
});
