import type { RNAcanvas } from './RNAcanvas';

import { KeyBinding } from '@rnacanvas/utilities';

import { consensusValue } from '@rnacanvas/consensize';

import { shift } from '@rnacanvas/layout';

export class ArrowKeyBindings {
  #targetApp;

  #keyBindings;

  #previousState?: NonNullObject;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.#keyBindings = [
      new KeyBinding('ArrowLeft', () => this.#shiftLeft()),
      new KeyBinding('ArrowRight', () => this.#shiftRight()),
      new KeyBinding('ArrowUp', () => this.#shiftUp()),
      new KeyBinding('ArrowDown', () => this.#shiftDown()),
    ];

    this.owner = targetApp.domNode;
  }

  [Symbol.iterator]() {
    return this.#keyBindings.values();
  }

  get owner() {
    return consensusValue(this.#keyBindings.map(kb => kb.owner));
  }

  set owner(owner) {
    this.#keyBindings.forEach(kb => kb.owner = owner);
  }

  #shiftLeft() {
    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length == 0) { return; }

    if (this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    let x = -1 / this.#targetApp.drawing.horizontalClientScaling;
    if (!Number.isFinite(x)) { x = -1; }

    shift(selectedBases, { x, y: 0 });
  }

  #shiftRight() {
    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length == 0) { return; }

    if (this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    let x = 1 / this.#targetApp.drawing.horizontalClientScaling;
    if (!Number.isFinite(x)) { x = 1; }

    shift(selectedBases, { x, y: 0 });
  }

  #shiftUp() {
    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length == 0) { return; }

    if (this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    let y = -1 / this.#targetApp.drawing.verticalClientScaling;
    if (!Number.isFinite(y)) { y = -1; }

    shift(selectedBases, { x: 0, y });
  }

  #shiftDown() {
    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length == 0) { return; }

    if (this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    let y = 1 / this.#targetApp.drawing.verticalClientScaling;
    if (!Number.isFinite(y)) { y = 1; }

    shift(selectedBases, { x: 0, y });
  }
}

type NonNullObject = { [name: string]: unknown };
