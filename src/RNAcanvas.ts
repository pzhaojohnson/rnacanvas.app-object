import { Drawing } from '@rnacanvas/draw';

import type { Nucleobase } from '@rnacanvas/draw';

import { CenteringScrollContainer } from './CenteringScrollContainer';

import { DrawingView } from './DrawingView';

import { PinchToScaleFeature } from '@rnacanvas/draw.svg.interact';

import { DotBracketDrawer } from '@rnacanvas/draw';

import { EventfulSet } from '@rnacanvas/utilities';

import { LiveSVGElementHighlightings } from '@rnacanvas/draw.svg.highlight';

import { ClickSelectTool } from '@rnacanvas/draw.svg.interact';

import { SelectedBases } from '@rnacanvas/draw.interact';

import { ConsecutiveBasesSelectingTool } from '@rnacanvas/draw.interact';

interface Form {
  /**
   * Appends the form to the provided container node.
   */
  appendTo(container: Node): void;
}

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

  private readonly drawingScrollContainer: CenteringScrollContainer;

  private readonly stackedDrawingsContainer: HTMLDivElement;

  /**
   * The user's view of the drawing.
   */
  readonly drawingView: DrawingView;

  /**
   * A pinch-to-scale feature for the drawing of the app.
   */
  private readonly pinchToScaleFeature: PinchToScaleFeature;

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

  readonly selectedBases: SelectedBases<Nucleobase>;

  private readonly consecutiveBasesSelectingTool: ConsecutiveBasesSelectingTool<Nucleobase>;

  /**
   * Forms are to go in here.
   */
  private readonly formsContainer: HTMLDivElement;

  constructor() {
    this.domNode = document.createElement('div');

    // give the app a gray and white checkerboard background
    this.domNode.style.background = 'repeating-conic-gradient(#eee 0% 25%, white 0% 50%) 50% / 20px 20px';

    this.boundingBox = document.createElement('div');
    this.domNode.appendChild(this.boundingBox);

    // fill up the space of the DOM node of the app object
    this.boundingBox.style.width = '100%';
    this.boundingBox.style.height = '100%';

    this.boundingBox.style.overflow = 'auto';

    // position all other elements of the app object relative to the bounding box
    this.boundingBox.style.position = 'relative';

    this.drawingScrollContainer = new CenteringScrollContainer();

    this.drawingScrollContainer.style.width = '100%';
    this.drawingScrollContainer.style.height = '100%';
    this.drawingScrollContainer.appendTo(this.boundingBox);

    this.stackedDrawingsContainer = document.createElement('div');
    this.stackedDrawingsContainer.style.position = 'relative';
    this.drawingScrollContainer.append(this.stackedDrawingsContainer);

    this.drawing = new Drawing();
    this.drawing.domNode.style.backgroundColor = 'white';

    // prevent highlighting of text when dragging drawing elements
    this.drawing.domNode.style.userSelect = 'none';

    this.overlaidDrawing = new Drawing();

    this.overlaidDrawing.domNode.style.position = 'absolute';
    this.overlaidDrawing.domNode.style.top = '0px';
    this.overlaidDrawing.domNode.style.left = '0px';
    this.overlaidDrawing.domNode.style.pointerEvents = 'none';

    // updates the boundaries and scalings of the overlaid drawing to match the main drawing of the app
    let overlaidDrawingResizer = new MutationObserver(() => {
      this.overlaidDrawing.setBoundaries(this.drawing);

      this.overlaidDrawing.horizontalScaling = this.drawing.horizontalScaling;
      this.overlaidDrawing.verticalScaling = this.drawing.verticalScaling;
    });

    overlaidDrawingResizer.observe(this.drawing.domNode, { attributes: true });

    this.stackedDrawingsContainer.append(this.drawing.domNode, this.overlaidDrawing.domNode);

    this.drawingView = new DrawingView(this.drawing, this.horizontalDrawingScrollbar, this.verticalDrawingScrollbar);

    this.pinchToScaleFeature = new PinchToScaleFeature(this.drawing.domNode, this.horizontalDrawingScrollbar, this.verticalDrawingScrollbar);

    this.selectedSVGElementHighlightings = new LiveSVGElementHighlightings(this.selectedSVGElements, this.drawing.domNode);
    this.selectedSVGElementHighlightings.appendTo(this.overlaidDrawing.domNode);

    this.clickSelectTool = new ClickSelectTool(this.drawing.domNode, this.selectedSVGElements);

    this.selectedBases = new SelectedBases(this.drawing, this.selectedSVGElements);

    this.consecutiveBasesSelectingTool = new ConsecutiveBasesSelectingTool(this.drawing, this.selectedBases);

    this.formsContainer = document.createElement('div');
    this.boundingBox.appendChild(this.formsContainer);

    this.dotBracketDrawer = new DotBracketDrawer(this.drawing);
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
   * The horizontal scrollbar for the drawing of the app.
   */
  get horizontalDrawingScrollbar() {
    return this.drawingScrollContainer.horizontalScrollbar;
  }

  /**
   * The vertical scrollbar for the drawing of the app.
   */
  get verticalDrawingScrollbar() {
    return this.drawingScrollContainer.verticalScrollbar;
  }

  /**
   * The scrollbars for the drawing of the app.
   */
  get drawingScrollbars() {
    return this.drawingScrollContainer.scrollbars;
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
   * Opens the provided form simply by adding it within the DOM structure of the RNAcanvas app.
   *
   * Forms are to be closed simply by removing them from the DOM structure of the RNAcanvas app
   * (e.g., by calling the `remove` method of the DOM node corresponding to the form).
   *
   * Forms input to this method should have absolute positioning
   * (i.e., have a `position` CSS property of `absolute`).
   *
   * Forms will be added in such a way that (with absolute positioning)
   * they will be positioned relative to the bounding box of the RNAcanvas app.
   */
  openForm(form: Node | Form): void {
    if (form instanceof Node) {
      this.formsContainer.appendChild(form);
    } else {
      form.appendTo(this.formsContainer);
    }
  }

  /**
   * The CSS style declaration for the actual DOM node of the app object.
   */
  get style() {
    return this.domNode.style;
  }
}
