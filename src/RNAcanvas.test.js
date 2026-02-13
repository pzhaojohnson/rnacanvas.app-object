/**
 * @jest-environment jsdom
 */

import { RNAcanvas } from './RNAcanvas';

import { consecutivePairs } from '@rnacanvas/base-pairs';

if (!SVGElement.prototype.viewBox) {
  SVGElement.prototype.viewBox = { baseVal: { width: 0, height: 0 } };
}

if (!SVGElement.prototype.x) {
  SVGElement.prototype.x = { baseVal: [{ value: 0 }] };
}

if (!SVGElement.prototype.y) {
  SVGElement.prototype.y = { baseVal: [{ value: 0 }] };
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

  test('`closeForm()`', () => {
    let app = new RNAcanvas();

    // no forms are open
    expect(() => app.closeForm()).not.toThrow();

    let form1 = document.createElement('div');
    let form2 = document.createElement('div');
    let form3 = document.createElement('div');

    form1.textContent = 'form1-6357165389';
    form2.textContent = 'form2-1894778369';
    form3.textContent = 'form3-83719789';

    app.openForm(form1);
    app.openForm(form2);
    app.openForm(form3);

    expect(app.domNode.textContent.includes('form3-83719789')).toBeTruthy();

    app.closeForm();

    // closed form 3
    expect(app.domNode.textContent.includes('form3-83719789')).toBeFalsy();

    // did not close forms 1 or 2
    expect(app.domNode.textContent.includes('form1-6357165389')).toBeTruthy();
    expect(app.domNode.textContent.includes('form2-1894778369')).toBeTruthy();
  });

  test('closeAllForms()', () => {
    let app = new RNAcanvas();

    // no forms are open
    expect(() => app.closeAllForms()).not.toThrow();

    let form1 = document.createElement('div');
    let form2 = document.createElement('div');
    let form3 = document.createElement('div');

    form1.textContent = 'form1-6357165389';
    form2.textContent = 'form2-1894778369';
    form3.textContent = 'form3-83719789';

    app.openForm(form1);
    app.openForm(form2);
    app.openForm(form3);

    expect(app.domNode.textContent.includes('form1-6357165389')).toBeTruthy();
    expect(app.domNode.textContent.includes('form2-1894778369')).toBeTruthy();
    expect(app.domNode.textContent.includes('form3-83719789')).toBeTruthy();

    app.closeAllForms();

    expect(app.domNode.textContent.includes('form1-6357165389')).toBeFalsy();
    expect(app.domNode.textContent.includes('form2-1894778369')).toBeFalsy();
    expect(app.domNode.textContent.includes('form3-83719789')).toBeFalsy();
  });

  test('style getter', () => {
    let rnaCanvas = new RNAcanvas();

    expect(rnaCanvas.style).toBe(rnaCanvas.domNode.style);
    expect(rnaCanvas.domNode.style).toBeTruthy();
  });

  test('`addToSelected()`', () => {
    let app = new RNAcanvas();

    [...'GAUCGAUCGAUGCUCGUAGUCG'].forEach(c => app.drawing.addBase(c));
    let bases = [...app.drawing.bases];

    let circles = [1, 2, 3, 4, 5].map(() => document.createElementNS('http://www.w3.org/2000/svg', 'circle'));
    circles.forEach(c => app.drawing.domNode.append(c));

    app.addToSelected([bases[7], circles[2]]);

    expect([...app.selectedBases].includes(bases[7])).toBeTruthy();

    // checking if an element is an SVG graphics element does not work properly in JSDOM
    expect([...app.selectedSVGElements][1]).toBeUndefined();
  });

  test('`removeFromSelected()`', () => {
    let app = new RNAcanvas();

    [...'GAUCGAUCGAUGCUCGUAGUCG'].forEach(c => app.drawing.addBase(c));
    let bases = [...app.drawing.bases];

    let circles = [1, 2, 3, 4, 5].map(() => document.createElementNS('http://www.w3.org/2000/svg', 'circle'));
    circles.forEach(c => app.drawing.domNode.append(c));

    app.addToSelected([bases[7], circles[2], bases[3], circles[1]]);

    expect([...app.selectedBases].includes(bases[7])).toBeTruthy();
    expect([...app.selectedBases].includes(bases[3])).toBeTruthy();

    // checking if an element is an SVG graphics element does not work properly with JSDOM
    expect([...app.selectedSVGElements].length).toBe(3);
    expect([...app.selectedSVGElements][1]).toBeUndefined();

    app.removeFromSelected([circles[2], bases[3]]);

    expect([...app.selectedBases].includes(bases[7])).toBeTruthy();
    expect([...app.selectedBases].includes(bases[3])).toBeFalsy();

    // checking if an element is an SVG graphics element does not work properly with JSDOM
    expect([...app.selectedSVGElements].length).toBe(1);
  });

  test('`deselect()`', () => {
    let app = new RNAcanvas();

    for (let i = 0; i < 10; i++) {
      let ele = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      app.drawing.domNode.append(ele);
      app.selectedSVGElements.addAll([ele]);
    }

    expect([...app.selectedSVGElements].length).toBe(10);

    app.deselect();

    expect([...app.selectedSVGElements].length).toBe(0);
  });

  test('`removeSelected()`', () => {
    let app = new RNAcanvas();

    for (let i = 0; i < 10; i++) {
      let ele = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      app.drawing.domNode.append(ele);
    }

    expect(app.drawing.domNode.childNodes.length).toBe(10);

    expect([...app.selectedSVGElements].length).toBe(0); // nothing to remove

    app.removeSelected();

    expect(app.drawing.domNode.childNodes.length).toBe(10); // nothing removed
    expect(app.canUndo()).toBeFalsy(); // didn't push undo stack

    app.selectedSVGElements.addAll([...app.drawing.domNode.childNodes].slice(3, 7));
    expect([...app.selectedSVGElements].length).toBe(4);

    app.removeSelected();

    expect(app.drawing.domNode.childNodes.length).toBe(6);
    expect(app.canUndo()).toBeTruthy(); // pushed undo stack
    expect([...app.selectedSVGElements].length).toBe(0); // deselected the removed elements
  });

  test('`get selectedNumberingLines()`', () => {
    var app = new RNAcanvas();

    app.drawDotBracket('AGCUUGUGCAUGCUGC', '..(((....)))..');

    var bases = [...app.drawing.bases];

    [1, 3, 4, 6, 7, 8].forEach(i => app.drawing.number(bases[i], i + 1));

    var numberingLines = [...app.drawing.numberingLines];

    app.addToSelected([2, 3, 5].map(i => numberingLines[i]));

    var selectedNumberingLines = app.selectedNumberingLines;

    expect([...selectedNumberingLines][0]).toBe(numberingLines[2]);
    expect([...selectedNumberingLines][1]).toBe(numberingLines[3]);
    expect([...selectedNumberingLines][2]).toBe(numberingLines[5]);

    expect([...selectedNumberingLines].length).toBe(3);

    var listener = jest.fn();

    selectedNumberingLines.addEventListener('change', listener);

    expect(listener).not.toHaveBeenCalled();

    app.addToSelected([numberingLines[0]]);
    expect(listener).toHaveBeenCalledTimes(1);

    app.removeFromSelected([numberingLines[5]]);
    expect(listener).toHaveBeenCalledTimes(2);

    // already removed
    app.removeFromSelected([numberingLines[4]]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('`get selectedOutlines()`', () => {
    let app = new RNAcanvas();

    let bases = [...'GAUCGAUCGAUGCUCGUAGUCG'].map(c => app.drawing.addBase(c));

    let outlines = bases.map(b => app.drawing.outline(b));

    let listener = jest.fn();

    app.selectedOutlines.addEventListener('change', listener);
    expect(listener).not.toHaveBeenCalled();

    app.addToSelected([outlines[0]]);

    expect([...app.selectedOutlines].includes(outlines[0])).toBeTruthy();
    expect(listener).toHaveBeenCalledTimes(1);

    app.addToSelected([outlines[5], outlines[2]]);

    expect([...app.selectedOutlines].includes(outlines[5])).toBeTruthy();
    expect([...app.selectedOutlines].includes(outlines[2])).toBeTruthy();

    expect(listener.mock.calls.length).toBe(2);
  });

  test('`get selectedPrimaryBonds()`', () => {
    let app = new RNAcanvas();

    let bases = [...'GAUCGAUCGAUGCUCGUAGUCG'].map(c => app.drawing.addBase(c));

    consecutivePairs(bases).forEach(([base1, base2]) => app.drawing.addPrimaryBond(base1, base2));

    let primaryBonds = [...app.drawing.primaryBonds];

    let listener = jest.fn();

    app.selectedPrimaryBonds.addEventListener('change', listener);
    expect(listener).not.toHaveBeenCalled();

    app.addToSelected([primaryBonds[0], primaryBonds[6], primaryBonds[4]]);

    expect([...app.selectedPrimaryBonds].includes(primaryBonds[0])).toBeTruthy();
    expect([...app.selectedPrimaryBonds].includes(primaryBonds[6])).toBeTruthy();
    expect([...app.selectedPrimaryBonds].includes(primaryBonds[4])).toBeTruthy();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('`get selectedSecondaryBonds()`', () => {
    let app = new RNAcanvas();

    let bases = [...'GAUCGAUCGAUGCUCGUAGUCG'].map(c => app.drawing.addBase(c));

    [[1, 13], [2, 12], [3, 11], [4, 10]].forEach(([i, j]) => app.drawing.addSecondaryBond(bases[i], bases[j]));

    let secondaryBonds = [...app.drawing.secondaryBonds];

    let listener = jest.fn();

    app.selectedSecondaryBonds.addEventListener('change', listener);
    expect(listener).not.toHaveBeenCalled();

    app.addToSelected([secondaryBonds[3], secondaryBonds[1]]);

    expect([...app.selectedSecondaryBonds].includes(secondaryBonds[3])).toBeTruthy();
    expect([...app.selectedSecondaryBonds].includes(secondaryBonds[1])).toBeTruthy();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('`serialized()`', () => {
    let app = new RNAcanvas();

    // add some contents to the drawing
    [...'GAUCGAUCGAUGCUCGUAGUCG'].forEach(c => app.drawing.addBase(c));

    [1, 5, 2, 8].forEach(i => {
      let b = [...app.drawing.bases][i];
      b.domNode.id = `id-${i}`;
      app.selectedSVGElements.addAll([b.domNode]);
    });

    expect(app.serialized().drawing).toStrictEqual(app.drawing.serialized());
    expect(app.drawing.serialized()).toBeTruthy();
    expect(app.drawing.serialized()).not.toEqual({});

    expect(app.serialized().selectedSVGElementIDs).toStrictEqual(['id-1', 'id-5', 'id-2', 'id-8']);

    expect(app.serialized().drawingView).toStrictEqual(app.drawingView.serialized());
    expect(app.drawingView.serialized()).toBeTruthy();
    expect(app.drawingView.serialized()).not.toEqual({});
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
    expect(app.canRedo()).toBeTruthy();

    // clears the redo stack
    app.pushUndoStack();
    expect(app.canRedo()).toBeFalsy();

    app.undo();

    // make the drawing unserializable
    for (let i = 0; i < 3; i++) { app.drawing.addBase('A'); }
    [...app.drawing.bases][1].domNode.id = '';

    expect(app.canRedo()).toBeTruthy();

    expect(() => app.pushUndoStack()).toThrow();

    // nothing got pushed onto the undo stack
    expect(app.canUndo()).toBeFalsy();

    // still cleared the redo stack (even though app serialization failed)
    expect(app.canRedo()).toBeFalsy();
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
    expect(() => app.undoStack.peek()).toThrow();

    let listeners = [1, 2, 3].map(() => jest.fn());
    listeners.forEach(li => app.undoStack.addEventListener('change', li));

    app.pushUndoStack();

    expect(app.undoStack.isEmpty()).toBe(false);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(1));

    let previousState = app.undoStack.peek();
    expect(previousState).toBeTruthy();

    // edit the drawing
    [...'agcuagcuagc'].forEach(c => app.drawing.addBase(c));

    app.undo();

    expect(app.undoStack.isEmpty()).toBe(true);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(2));

    app.redo();

    expect(app.undoStack.isEmpty()).toBe(false);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(3));
    expect(app.undoStack.peek()).toStrictEqual(previousState);

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
    expect(() => app.redoStack.peek()).toThrow();

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

    let previousState = app.redoStack.peek();
    expect(previousState).toBeTruthy();

    app.redo();

    expect(app.redoStack.isEmpty()).toBe(true);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(2));

    // should not call listeners anymore
    listeners.forEach(li => app.redoStack.removeEventListener('change', li));

    app.undo();

    expect(app.redoStack.isEmpty()).toBe(false);
    listeners.forEach(li => expect(li).toHaveBeenCalledTimes(2));
    expect(app.redoStack.peek()).toStrictEqual(previousState);
  });

  test('`newTab()`', () => {
    let app = new RNAcanvas();

    window.open = jest.fn();

    app.newTab();

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open.mock.calls[0][0]).toBe('https://code.rnacanvas.app');
    expect(window.open.mock.calls[0][1]).toBe('_blank');
    expect(window.open.mock.calls[0].length).toBe(2);
  });
});
