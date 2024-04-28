import { Drawing } from '@rnacanvas/draw';

import { Scrollbars } from '@rnacanvas/scrollbars';

import { Nucleobase } from '@rnacanvas/draw';

import { StraightBond } from '@rnacanvas/draw';

import { parseDotBracket } from '@rnacanvas/base-pairs';

import { radialize } from '@rnacanvas/bases-layout';

import { Centroid } from '@rnacanvas/bases-layout';

/**
 * An RNAcanvas app object that can be included as a component of a web page / app.
 */
export class RNAcanvas {
  /**
   * The actual DOM node of the RNAcanvas app object.
   *
   * Contains the entirety of the RNAcanvas app.
   */
  readonly domNode: HTMLElement;

  /**
   * Meant to fill up the space of the DOM node of the app object
   * and for other components of the app object to be positioned relative to it.
   *
   * The purpose of separating the bounding box from the outermost DOM node of the app object
   * is so that styles applied to the outermost DOM node do not affect the bounding box.
   */
  private boundingBox: HTMLDivElement;

  /**
   * The 2D nucleic acid structure drawing of the app object.
   */
  readonly drawing: Drawing;

  /**
   * The scrollbars controlling the user's view of the drawing.
   */
  readonly drawingScrollbars: Scrollbars;

  constructor() {
    this.domNode = document.createElement('div');

    this.boundingBox = document.createElement('div');
    this.domNode.appendChild(this.boundingBox);

    // fill up the space of the DOM node of the app object
    this.boundingBox.style.width = '100%';
    this.boundingBox.style.height = '100%';

    this.boundingBox.style.overflow = 'auto';

    // position all other elements of the app object relative to the bounding box
    this.boundingBox.style.position = 'relative';

    this.drawing = new Drawing();
    this.drawing.appendTo(this.boundingBox);

    this.drawingScrollbars = new Scrollbars(this.boundingBox);
  }

  /**
   * Appends the DOM node of the app object to the given container node.
   */
  appendTo(container: Node): void {
    container.appendChild(this.domNode);
  }

  /**
   * Removes the DOM node of the app object from its parent container node.
   *
   * (Has no effect if the DOM node of the app object had no parent container node to begin with.)
   */
  remove(): void {
    this.domNode.remove();
  }

  /**
   * Draws the structure given in dot-bracket notation.
   *
   * Will create a nucleobase for each character in the sequence string of the structure.
   *
   * Will create a secondary bond for each base-pair in the structure.
   *
   * Will throw if the dot-bracket notation is invalid
   * (i.e., contains unmatched upstream and/or downstream partner(s)).
   *
   * Currently, only simple dot-bracket notation is supported
   * (i.e., containing only the characters ".", "(" and ")").
   *
   * Dot-bracket notation is allowed to be shorter than the sequence length.
   *
   * @param seq The sequence of the structure.
   * @param dotBracket Dot-bracket notation of the base-pairs in the structure.
   */
  drawDotBracket(seq: string, dotBracket: string): void | never {
    let bases = [...seq].map(c => Nucleobase.create(c));
    bases.forEach(b => this.drawing.appendBase(b));

    let basePairs = [...parseDotBracket(bases, dotBracket)];
    basePairs.forEach(bp => this.drawing.appendSecondaryBond(StraightBond.between(...bp)));

    this.drawing.allSecondaryBonds.forEach(sb => {
      sb.setAttribute('stroke-width', '2');
      sb.basePadding1 = 5;
      sb.basePadding2 = 5;
    });

    radialize(bases, basePairs, { spacing: 20, basePairSpacing: 20, hairpinLoopSpacing: 10 });
    (new Centroid(bases)).set({ x: 800, y: 800 });

    this.drawing.domNode.setAttribute('viewBox', '0 0 1600 1600');
    this.drawing.domNode.setAttribute('width', '1600px');
    this.drawing.domNode.setAttribute('height', '1600px');
  }
}
