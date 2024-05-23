import { Drawing } from '@rnacanvas/draw';

import { HorizontalScrollbar, VerticalScrollbar } from '@rnacanvas/scrollbars';

import { Scrollbars } from '@rnacanvas/scrollbars';

import { DrawingView } from './DrawingView';

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
   * The horizontal scrollbar for the drawing.
   */
  readonly horizontalDrawingScrollbar: HorizontalScrollbar;

  /**
   * The vertical scrollbar for the drawing.
   */
  readonly verticalDrawingScrollbar: VerticalScrollbar;

  /**
   * The scrollbars controlling the user's view of the drawing.
   */
  readonly drawingScrollbars: Scrollbars;

  /**
   * The user's view of the drawing.
   */
  readonly drawingView: DrawingView;

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

    this.horizontalDrawingScrollbar = new HorizontalScrollbar(this.boundingBox);
    this.verticalDrawingScrollbar = new VerticalScrollbar(this.boundingBox);

    this.drawingScrollbars = new Scrollbars(this.boundingBox);

    this.drawingView = new DrawingView(this.drawing, this.horizontalDrawingScrollbar, this.verticalDrawingScrollbar);
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
   * The CSS style declaration for the actual DOM node of the app object.
   */
  get style() {
    return this.domNode.style;
  }
}
