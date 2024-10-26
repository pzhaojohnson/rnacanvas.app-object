import { Drawing } from '@rnacanvas/draw';

import type { Nucleobase } from '@rnacanvas/draw';

import { InvertedStraightBondsHider } from '@rnacanvas/draw.bonds';

import { CenteringScrollContainer } from './CenteringScrollContainer';

import { DrawingView } from './DrawingView';

import { isBeingInteractedWith } from '@rnacanvas/utilities';

import { KeyBinding } from '@rnacanvas/utilities';

import { PinchToScaleFeature } from '@rnacanvas/draw.svg.interact';

import { DotBracketDrawer } from '@rnacanvas/draw';

import { SchemaDrawer } from '@rnacanvas/draw';

import { EventfulSet } from '@rnacanvas/utilities';

import { LiveSVGElementHighlightings } from '@rnacanvas/draw.svg.highlight';

import { ClickSelectTool } from '@rnacanvas/draw.svg.interact';

import { SelectingRect } from '@rnacanvas/draw.svg.interact';

import { CtrlASelector } from './CtrlASelector';

import { SelectedBases } from '@rnacanvas/draw.interact';

import { ConsecutiveBasesSelectingTool } from '@rnacanvas/draw.interact';

import { DraggingTool } from '@rnacanvas/draw.interact';

import { FormsFronter } from './FormsFronter';

import { BasesLayoutForm as LayoutForm } from '@rnacanvas/forms.bases-layout';

import { ExportForm } from '@rnacanvas/forms.export';

import { Toolbar, ToolbarToggle } from '@rnacanvas/toolbar';

import $ from 'jquery';

import { FiniteStack } from '@rnacanvas/utilities';

import { isNonNullObject } from '@rnacanvas/value-check';

interface Form {
  /**
   * Appends the form to the provided container node.
   */
  appendTo(container: Node): void;
}

function isSVGGraphicsElement(value: unknown): value is SVGGraphicsElement {
  return value instanceof SVGGraphicsElement;
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

  private readonly invertedPrimaryBondsHider: InvertedStraightBondsHider;

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

  #schemaDrawer: SchemaDrawer;

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

  private readonly selectingRect: SelectingRect;

  private readonly ctrlASelector: CtrlASelector;

  readonly selectedBases: SelectedBases<Nucleobase>;

  private readonly consecutiveBasesSelectingTool: ConsecutiveBasesSelectingTool<Nucleobase>;

  private readonly draggingTool: DraggingTool;

  /**
   * Forms are to go in here.
   */
  private readonly formsContainer: HTMLDivElement;

  #formsFronter: FormsFronter;

  readonly layoutForm: LayoutForm;

  readonly exportForm: ExportForm;

  private readonly toolbar;

  private readonly toolbarContainer = document.createElement('div');

  #undoStack: FiniteStack<ReturnType<InstanceType<typeof RNAcanvas>['serialized']>> = new FiniteStack(50);

  #redoStack: FiniteStack<ReturnType<InstanceType<typeof RNAcanvas>['serialized']>> = new FiniteStack(50);

  constructor() {
    this.domNode = document.createElement('div');

    // give the app a gray and white checkerboard background
    this.domNode.style.background = 'repeating-conic-gradient(#eee 0% 25%, white 0% 50%) 50% / 20px 20px';

    this.boundingBox = document.createElement('div');
    this.domNode.appendChild(this.boundingBox);

    // fill up the space of the DOM node of the app object
    this.boundingBox.style.width = '100%';
    this.boundingBox.style.height = '100%';

    this.boundingBox.style.overflow = 'hidden';

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

    $(this.drawing.domNode).css({ backgroundColor: 'white' });
    $(this.drawing.domNode).css({ userSelect: 'none', webkitUserSelect: 'none' });
    $(this.drawing.domNode).css({ cursor: 'default' });

    this.invertedPrimaryBondsHider = new InvertedStraightBondsHider(
      { [Symbol.iterator]: () => [...this.drawing.primaryBonds].values() },
      this.drawing.domNode,
    );

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

    this.pinchToScaleFeature = new PinchToScaleFeature(this.drawing.domNode);
    this.pinchToScaleFeature.horizontalScrollbar = this.horizontalDrawingScrollbar;
    this.pinchToScaleFeature.verticalScrollbar = this.verticalDrawingScrollbar;
    this.pinchToScaleFeature.interactionScope = this.domNode;
    this.pinchToScaleFeature.beforeScaling = () => this.hideOverlaidDrawing();
    this.pinchToScaleFeature.afterScaling = () => this.unhideOverlaidDrawing();

    this.selectedSVGElementHighlightings = new LiveSVGElementHighlightings(this.selectedSVGElements, this.drawing.domNode);
    this.selectedSVGElementHighlightings.appendTo(this.overlaidDrawing.domNode);

    this.clickSelectTool = new ClickSelectTool(this.drawing.domNode, this.selectedSVGElements);

    this.selectingRect = new SelectingRect(this.drawing.domNode, this.selectedSVGElements);
    this.selectingRect.appendTo(this.overlaidDrawing.domNode);

    this.ctrlASelector = new CtrlASelector({
      domNode: this.domNode,
      selectAll: () => this.selectAll(),
    });

    this.selectedBases = new SelectedBases(this.drawing, this.selectedSVGElements);

    this.consecutiveBasesSelectingTool = new ConsecutiveBasesSelectingTool(this.drawing, this.selectedBases);

    this.draggingTool = new DraggingTool(
      this.drawing,
      {
        svgElements: this.selectedSVGElements,
        bases: this.selectedBases,
      },
      {
        beforeDragging: () => this.hideOverlaidDrawing(),
        afterDragging: () => this.unhideOverlaidDrawing(),
      },
    );

    this.formsContainer = document.createElement('div');
    this.boundingBox.appendChild(this.formsContainer);

    this.#formsFronter = new FormsFronter(this.formsContainer);

    this.layoutForm = new LayoutForm(this.drawing, this.selectedBases, {
      beforeMovingBases: () => this.hideOverlaidDrawing(),
      afterMovingBases: () => this.unhideOverlaidDrawing(),
    });

    this.exportForm = new ExportForm({ drawing: this.drawing });

    this.dotBracketDrawer = new DotBracketDrawer(this.drawing);

    this.#schemaDrawer = new SchemaDrawer(this.drawing);

    this.toolbar = new Toolbar({
      drawing: this.drawing,
      selectedBases: this.selectedBases,
      beforeDragging: () => this.hideOverlaidDrawing(),
      afterDragging: () => this.unhideOverlaidDrawing(),
      undo: () => this.undo(),
      redo: () => this.redo(),
      canUndo: () => this.canUndo(),
      canRedo: () => this.canRedo(),
      forms: {
        'layout': this.layoutForm,
        'export': this.exportForm,
      },
      openForm: (form: Form) => this.openForm(form),
    });

    let selectInterveningKeyBinding = new KeyBinding('I', () => this.toolbar.buttons['select-intervening'].press());
    selectInterveningKeyBinding.scope = this.domNode;
    this.toolbar.buttons['select-intervening'].boundKey = selectInterveningKeyBinding.key;

    let editLayoutKeyBinding = new KeyBinding('L', () => this.toolbar.buttons['layout'].press());
    editLayoutKeyBinding.scope = this.domNode;
    this.toolbar.buttons['layout'].boundKey = editLayoutKeyBinding.key;

    let exportKeyBinding = new KeyBinding('E', () => this.toolbar.buttons['export'].press());
    exportKeyBinding.scope = this.domNode;
    this.toolbar.buttons['export'].boundKey = exportKeyBinding.key;

    this.toolbar.appendTo(this.toolbarContainer);
    this.boundingBox.append(this.toolbarContainer);

    let toolbarToggle = new ToolbarToggle({ toolbar: this.toolbar });
    $(toolbarToggle.domNode).css({ position: 'absolute', bottom: '22.5px', left: '15px' });

    let toolbarToggleKeyBinding = new KeyBinding('T', () => toolbarToggle.press());
    toolbarToggleKeyBinding.scope = this.domNode;
    toolbarToggle.boundKey = toolbarToggleKeyBinding.key;

    let toolbarToggleContainer = document.createElement('div');
    toolbarToggleContainer.append(toolbarToggle.domNode);
    this.boundingBox.append(toolbarToggleContainer);
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
   * Hides the overlaid drawing by setting its `visibility` CSS property to `hidden`.
   *
   * Can be used to hide element highlightings (e.g., when dragging elements).
   */
  private hideOverlaidDrawing(): void {
    this.overlaidDrawing.domNode.style.visibility = 'hidden';
  }

  /**
   * Undoes the action(s) of the `hideOverlaidDrawing` method.
   */
  private unhideOverlaidDrawing(): void {
    this.overlaidDrawing.domNode.style.visibility = 'visible';
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
   * Draws the provided schema (on top of whatever is currently already drawn).
   *
   * See the R2DT RNA 2D JSON schema format for more information on schemas.
   *
   * This method might throw for invalid schemas,
   * in which case the drawing of the app might get left in a partially drawn state
   * (e.g., with only part of the schema having been drawn).
   */
  drawSchema(schema: Parameters<SchemaDrawer['draw']>[0]): void | never {
    this.#schemaDrawer.draw(schema);
  }

  /**
   * Returns true if the DOM node corresponding to the app object
   * is currently being interacted with by the user.
   */
  isBeingInteractedWith(): boolean {
    return isBeingInteractedWith(this.domNode);
  }

  /**
   * The currently selected SVG element.
   *
   * This getter will throw if no SVG elements or more than one SVG element
   * are currently selected.
   */
  get selectedSVGElement(): SVGGraphicsElement | never {
    let selectedSVGElements = [...this.selectedSVGElements];

    if (selectedSVGElements.length == 1) {
      return selectedSVGElements[0];
    } else if (selectedSVGElements.length > 1) {
      throw new Error('More than one SVG element is selected.');
    } else {
      throw new Error('No SVG elements are selected.');
    }
  }

  /**
   * Selects all SVG (graphics) elements in the drawing of the app.
   */
  selectAll(): void {
    this.selectedSVGElements.addAll([...this.drawing.domNode.children].filter(isSVGGraphicsElement));
  }

  /**
   * The currently selected base.
   *
   * This getter will throw if no bases or more than one base are currently selected.
   */
  get selectedBase(): Nucleobase | never {
    let selectedBases = [...this.selectedBases];

    if (selectedBases.length == 1) {
      return selectedBases[0];
    } else if (selectedBases.length > 1) {
      throw new Error('More than one base is selected.');
    } else {
      throw new Error('No bases are selected.');
    }
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

  /**
   * Returns the serialized form of an app instance
   * (e.g., which can be saved in a file).
   *
   * Throws if unable to properly serialize the app instance.
   */
  serialized() {
    return {
      drawing: this.drawing.serialized(),
    };
  }

  /**
   * Restores a previous state of the app.
   *
   * Throws if unable to do so.
   *
   * This method is atomic in that
   * if it is unable to restore a previous app state
   * then the current state of the app will be left unchanged.
   *
   * @param previousState The serialized form of an app instance.
   */
  restore(previousState: unknown): void | never {
    if (!isNonNullObject(previousState)) { throw new Error('Previous app state must be an object.'); }

    if (!previousState.drawing) { throw new Error('Previous app state is missing a drawing.'); }

    // can throw (in an atomic way)
    this.drawing.restore(previousState.drawing);
  }

  /**
   * Pushes the current state of the app onto the top of the undo stack.
   *
   * Throws if unable to do so
   * (e.g., the app instance is unable to be properly serialized).
   */
  pushUndoStack(): void | never {
    this.#undoStack.push(this.serialized());
  }

  canUndo(): boolean {
    return this.#undoStack.size > 0;
  }

  /**
   * Throws if the undo stack is empty,
   * if the current state of the app cannot be properly serialized
   * (so that it can be pushed onto the redo stack),
   * or if the app state at the top of the undo stack cannot be restored.
   *
   * This method is atomic in that when it throws
   * the current state of the app will be left unchanged.
   */
  undo(): void | never {
    let currentState = this.serialized();

    this.restore(this.#undoStack.pop());

    this.#redoStack.push(currentState);
  }

  /**
   * The undo stack interface.
   */
  get undoStack() {
    return {
      isEmpty: () => this.#undoStack.isEmpty(),
      addEventListener: (name: 'change', listener: () => void) => this.#undoStack.addEventListener(name, listener),
      removeEventListener: (name: 'change', listener: () => void) => this.#undoStack.removeEventListener(name, listener),
    };
  }

  canRedo(): boolean {
    return this.#redoStack.size > 0;
  }

  /**
   * Throws if the redo stack is empty,
   * if the current state of the app cannot be properly serialized
   * (so that it can be pushed onto the undo stack),
   * or if the app state at the top of the redo stack cannot be restored.
   *
   * This method is atomic in that when it throws
   * the current state of the app will be left unchanged.
   */
  redo(): void | never {
    let currentState = this.serialized();

    this.restore(this.#redoStack.pop());

    this.#undoStack.push(currentState);
  }

  /**
   * The redo stack interface.
   */
  get redoStack() {
    return {
      isEmpty: () => this.#redoStack.isEmpty(),
      addEventListener: (name: 'change', listener: () => void) => this.#redoStack.addEventListener(name, listener),
      removeEventListener: (name: 'change', listener: () => void) => this.#redoStack.removeEventListener(name, listener),
    };
  }
}
