/**
 * @jest-environment jsdom
 */

import { RNAcanvas } from './RNAcanvas';

describe('RNAcanvas class', () => {
  it('can be instantiated', () => {
    expect(() => new RNAcanvas()).not.toThrow();
  });

  it('can be appended to a container element', () => {
    let rnaCanvas = new RNAcanvas();
    let container = document.createElement('div');

    expect(container.contains(rnaCanvas.domNode)).toBeFalsy();
    container.appendChild(rnaCanvas.domNode);
    expect(container.childNodes[0]).toBe(rnaCanvas.domNode);
  });
});
