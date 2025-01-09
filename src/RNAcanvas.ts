import { Drawing } from '@rnacanvas/draw';

import type { Nucleobase } from '@rnacanvas/draw';

import { InvertedStraightBondsHider } from '@rnacanvas/draw.bonds';

import { CenteringScrollContainer } from './CenteringScrollContainer';

import { DrawingView } from './DrawingView';

import { KeyBinding } from '@rnacanvas/utilities';

import { PinchToScaleFeature } from '@rnacanvas/draw.svg.interact';

import { DotBracketDrawer } from '@rnacanvas/draw';

import { SchemaDrawer } from '@rnacanvas/draw';

import { EventfulSet } from '@rnacanvas/utilities';

import { LiveSVGElementHighlightings } from '@rnacanvas/draw.svg.highlight';

import { ClickSelectTool } from '@rnacanvas/draw.svg.interact';

import { SelectingRect } from '@rnacanvas/draw.svg.interact';

import { SelectedBases } from '@rnacanvas/draw.interact';

import { ConsecutiveBasesSelectingTool } from '@rnacanvas/draw.interact';

import { DraggingTool } from '@rnacanvas/draw.interact';

import { OpenButton } from '@rnacanvas/buttons';
import { OpenForm } from '@rnacanvas/forms.open';

import { SaveButton } from '@rnacanvas/buttons';

import { FormsFronter } from './FormsFronter';

import { BasesLayoutForm as LayoutForm } from '@rnacanvas/forms.bases-layout';

import { ExportForm } from '@rnacanvas/forms.export';

import { AboutButton } from '@rnacanvas/buttons';
import { AboutForm } from '@rnacanvas/forms.about';

import { Toolbar, ToolbarToggle } from '@rnacanvas/toolbar';

import { SilvecPlug } from './SilvecPlug';

import { DropHandler } from '@rnacanvas/drop-interface';

import { DownloadableFile } from '@rnacanvas/utilities';

import $ from 'jquery';

import { FiniteStack } from '@rnacanvas/utilities';

import { isNonNullObject } from '@rnacanvas/value-check';

import { isStringsArray } from '@rnacanvas/value-check';

import { isSVGGraphicsElementsArray } from '@rnacanvas/draw.svg';

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

  #selectAllKeyBinding;

  readonly selectedBases: SelectedBases<Nucleobase>;

  private readonly consecutiveBasesSelectingTool: ConsecutiveBasesSelectingTool<Nucleobase>;

  private readonly draggingTool: DraggingTool;

  #openForm;

  #saveButton;

  #saveKeyBindings;

  /**
   * Forms are to go in here.
   */
  private readonly formsContainer: HTMLDivElement;

  #formsFronter: FormsFronter;

  readonly layoutForm: LayoutForm;

  readonly exportForm: ExportForm;

  #aboutForm;

  #aboutButton;
  #aboutButtonContainer = document.createElement('div');

  private readonly toolbar;

  private readonly toolbarContainer = document.createElement('div');

  #toolbarToggleKeyBinding;

  #silvecPlug;

  #undoStack: FiniteStack<ReturnType<InstanceType<typeof RNAcanvas>['serialized']>> = new FiniteStack(50);

  #redoStack: FiniteStack<ReturnType<InstanceType<typeof RNAcanvas>['serialized']>> = new FiniteStack(50);

  #dropHandler;

  constructor() {
    this.domNode = document.createElement('div');

    // make focusable for key bindings to work
    this.domNode.tabIndex = 0;

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

    this.#selectAllKeyBinding = new KeyBinding('A', () => this.selectAll(), { ctrlKey: true });

    this.selectedBases = new SelectedBases(this.drawing, this.selectedSVGElements);

    this.consecutiveBasesSelectingTool = new ConsecutiveBasesSelectingTool(this.drawing, this.selectedBases);

    this.draggingTool = new DraggingTool(
      this.drawing,
      {
        svgElements: this.selectedSVGElements,
        bases: this.selectedBases,
        baseNumberings: this.selectedBaseNumberings,
      },
      {
        beforeDragging: () => this.beforeDragging(),
        afterDragging: () => this.afterDragging(),
      },
    );

    this.#openForm = new OpenForm();

    let openButton = new OpenButton();
    openButton.domNode.addEventListener('click', () => this.openForm(this.#openForm));
    $(openButton.domNode).css({ position: 'absolute', top: '11px', left: '28px' });
    this.boundingBox.append(openButton.domNode);

    this.#saveButton = new SaveButton();
    this.#saveButton.domNode.addEventListener('click', () => this.save());
    $(this.#saveButton.domNode).css({ position: 'absolute', top: '11px', left: '95px' });
    this.boundingBox.append(this.#saveButton.domNode);

    this.#saveKeyBindings = [
      new KeyBinding('S', () => this.save(), { ctrlKey: true }),
      new KeyBinding('S', () => this.save(), { metaKey: true }),
    ];

    this.#saveKeyBindings.forEach(kb => kb.owner = this.domNode);

    this.formsContainer = document.createElement('div');
    this.boundingBox.appendChild(this.formsContainer);

    this.#formsFronter = new FormsFronter(this.formsContainer);

    this.layoutForm = new LayoutForm(this.drawing, this.selectedBases, {
      beforeMovingBases: () => this.beforeDragging(),
      afterMovingBases: () => this.afterDragging(),
    });

    this.exportForm = new ExportForm({ drawing: this.drawing });

    this.#aboutForm = new AboutForm();

    this.#aboutButton = new AboutButton();
    this.#aboutButton.domNode.addEventListener('click', () => this.openForm(this.#aboutForm));
    this.#aboutButtonContainer.append(this.#aboutButton.domNode);
    this.boundingBox.append(this.#aboutButtonContainer);

    this.dotBracketDrawer = new DotBracketDrawer(this.drawing);

    this.#schemaDrawer = new SchemaDrawer(this.drawing);

    this.toolbar = new Toolbar({
      drawing: this.drawing,
      selectedBases: this.selectedBases,
      beforeDragging: () => this.beforeDragging(),
      afterDragging: () => this.afterDragging(),
      undo: () => this.undo(),
      redo: () => this.redo(),
      undoStack: this.undoStack,
      redoStack: this.redoStack,
      forms: {
        'layout': this.layoutForm,
        'export': this.exportForm,
      },
      openForm: (form: Form) => this.openForm(form),
    });

    this.toolbar.appendTo(this.toolbarContainer);
    this.boundingBox.append(this.toolbarContainer);

    [...this.toolbar.keyBindings].forEach(kb => kb.owner = this.domNode);

    let toolbarToggle = new ToolbarToggle({ toolbar: this.toolbar });
    $(toolbarToggle.domNode).css({ position: 'absolute', bottom: '22.5px', left: '15px' });

    this.#toolbarToggleKeyBinding = new KeyBinding('T', () => toolbarToggle.press());
    this.#toolbarToggleKeyBinding.owner = this.domNode;
    toolbarToggle.boundKey = this.#toolbarToggleKeyBinding.key;

    let toolbarToggleContainer = document.createElement('div');
    toolbarToggleContainer.append(toolbarToggle.domNode);
    this.boundingBox.append(toolbarToggleContainer);

    this.#silvecPlug = SilvecPlug();
    this.boundingBox.append(this.#silvecPlug);

    this.#dropHandler = new DropHandler({
      undo: () => this.undo(),
      pushUndoStack: () => this.pushUndoStack(),
      restore: (previousState: unknown) => this.restore(previousState),
    });

    this.domNode.addEventListener('drop', event => this.#dropHandler.handle(event));
    this.domNode.addEventListener('dragover', event => event.preventDefault());
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

  get selectedBaseNumberings(): Iterable<BaseNumbering> {
    let getSelectedBaseNumberings = () => {
      let selectedSVGElements = new Set(this.selectedSVGElements);

      return [...this.drawing.baseNumberings].filter(bn => selectedSVGElements.has(bn.domNode));
    };

    return {
      [Symbol.iterator]() { return getSelectedBaseNumberings().values(); },
    };
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
      selectedSVGElementIDs: [...this.selectedSVGElements].map(ele => ele.id),
      drawingView: this.drawingView.serialized(),
    };
  }

  /**
   * Offers for download an RNAcanvas file of the current state of the app.
   */
  save(): void {
    let f = new DownloadableFile(JSON.stringify(this.serialized()));

    let name = document.title ? document.title : 'RNAcanvas Code';

    f.downloadAs(name + '.rnacanvas', { type: 'text/plain' });
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

    let selectedSVGElementIDs: string[] = isStringsArray(previousState.selectedSVGElementIDs) ? previousState.selectedSVGElementIDs : [];
    let selectedSVGElements = selectedSVGElementIDs.map(id => this.drawing.domNode.querySelector('#' + id));

    this.selectedSVGElements.clear();

    // only restore if all previously selected SVG elements were successfully retrieved
    isSVGGraphicsElementsArray(selectedSVGElements) ? this.selectedSVGElements.addAll(selectedSVGElements) : {};

    if (previousState.drawingView) {
      try { this.drawingView.restore(previousState.drawingView); } catch (error) { console.warn(error); }
    }
  }

  /**
   * Pushes the current state of the app onto the top of the undo stack
   * and clears the redo stack.
   *
   * Throws if unable to do so
   * (e.g., the app instance is unable to be properly serialized).
   */
  pushUndoStack(): void | never {
    // want to clear the redo stack even if app serialization fails
    this.#redoStack.empty();

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

  beforeEdit() {
    // don't let this disrupt editing (even if it throws)
    try {
      this.pushUndoStack();
    } catch (error: unknown) {
      console.warn(error);
    }
  }

  afterEdit() {}

  beforeDragging() {
    this.beforeEdit();

    this.hideOverlaidDrawing();
  }

  afterDragging() {
    this.unhideOverlaidDrawing();
  }

  get keyBindings(): Iterable<{ owner: Element | undefined }> {
    return [
      ...this.toolbar.keyBindings,
      this.#selectAllKeyBinding,
      ...this.#saveKeyBindings,
      this.#toolbarToggleKeyBinding,
    ];
  }
}

type BaseNumbering = ReturnType<InstanceType<typeof RNAcanvas>['drawing']['number']>[0];
