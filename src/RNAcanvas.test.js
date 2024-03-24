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

  describe('drawDotBracket method', () => {
    let rnaCanvas = new RNAcanvas();

    rnaCanvas.drawDotBracket('AUCGUAGCUGCUGUGCUAGC', '..(((.....)))....');

    let allBasesSorted = [...rnaCanvas.drawing.allBasesSorted];
    let allSecondaryBonds = [...rnaCanvas.drawing.allSecondaryBonds];

    it('appends a sequence of bases matching the given sequence', () => {
      expect(allBasesSorted.map(b => b.textContent).join('')).toBe('AUCGUAGCUGCUGUGCUAGC');
    });

    it('appends secondary bonds corresponding to the base-pairs specified in the dot-bracket notation', () => {
      expect(allSecondaryBonds.map(sb => allBasesSorted.indexOf(sb.base1))).toStrictEqual([2, 3, 4]);
      expect(allSecondaryBonds.map(sb => allBasesSorted.indexOf(sb.base2))).toStrictEqual([12, 11, 10]);
    });
  });
});