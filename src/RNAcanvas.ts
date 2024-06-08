import { Drawing } from '@rnacanvas/draw';

import { HorizontalScrollbar, VerticalScrollbar } from '@rnacanvas/scrollbars';

import { Scrollbars } from '@rnacanvas/scrollbars';

import { DrawingView } from './DrawingView';

import { DotBracketDrawer } from '@rnacanvas/draw';

import { EventfulSet } from '@rnacanvas/utilities';

import { LiveSVGElementHighlightings } from '@rnacanvas/draw.svg.highlight';

import { ClickSelectTool } from '@rnacanvas/draw.svg.interact';

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

  private dotBracketDrawer: DotBracketDrawer;

  /**
   * The set of SVG elements in the drawing of the app that are currently selected.
   */
  readonly selectedSVGElements: EventfulSet<SVGGraphicsElement> = new EventfulSet();

  /**
   * A drawing overlaid and sized to match the main drawing of the app.
   *
   * Can be used for highlightings of SVG elements (such as the currently selected SVG elements).
   */
  private readonly overlaidDrawing: Drawing;

  /**
   * Highlightings of the currently selected SVG elements in the drawing of the app.
   */
  private readonly selectedSVGElementHighlightings: LiveSVGElementHighlightings;

  private readonly clickSelectTool: ClickSelectTool;

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

    this.dotBracketDrawer = new DotBracketDrawer(this.drawing);

    this.overlaidDrawing = new Drawing();

    this.overlaidDrawing.domNode.style.position = 'absolute';
    this.overlaidDrawing.appendTo(this.boundingBox);

    // updates the boundaries and scalings of the overlaid drawing to match the main drawing of the app
    let overlaidDrawingResizer = new MutationObserver(() => {
      this.overlaidDrawing.setBoundaries(this.drawing);

      this.overlaidDrawing.horizontalScaling = this.drawing.horizontalScaling;
      this.overlaidDrawing.verticalScaling = this.drawing.verticalScaling;
    });

    overlaidDrawingResizer.observe(this.drawing.domNode, { attributes: true });

    this.selectedSVGElementHighlightings = new LiveSVGElementHighlightings(this.selectedSVGElements, this.drawing.domNode);
    this.selectedSVGElementHighlightings.appendTo(this.overlaidDrawing.domNode);

    this.clickSelectTool = new ClickSelectTool(this.drawing.domNode, this.selectedSVGElements);
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
   * Draws the specified structure (expressed in dot-bracket notation) on the drawing of the app.
   *
   * A nucleobase will be added to the drawing for each character in the sequence of the structure.
   *
   * A secondary bond will be added to the drawing for each base-pair expressed in the dot-bracket notation
   * for the structure.
   *
   * Currently, this method is only able to handle simple dot-bracket notation
   * (i.e., that only contains the characters ".", "(" and ")").
   *
   * A primary bond will also be added between each consecutive pair of bases in the sequence of bases.
   *
   * This method will also radialize the layout of the drawn bases.
   *
   * @param seq The sequence of the structure to draw.
   * @param dotBracket Dot-bracket notation expressing the base-pairs in the structure to draw.
   */
  drawDotBracket(seq: string, dotBracket: string): void {
    this.dotBracketDrawer.draw(seq, dotBracket);
  }

  /**
   * The CSS style declaration for the actual DOM node of the app object.
   */
  get style() {
    return this.domNode.style;
  }
}
