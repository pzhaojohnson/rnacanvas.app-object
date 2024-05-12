/**
 * @jest-environment jsdom
 */

import { RNAcanvas } from './RNAcanvas';

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
});
