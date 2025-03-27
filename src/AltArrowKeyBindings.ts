import type { RNAcanvas } from './RNAcanvas';

import { KeyBinding } from '@rnacanvas/utilities';

import { consensusValue } from '@rnacanvas/consensize';

import { rotate } from '@rnacanvas/layout';

export class AltArrowKeyBindings {
  #targetApp;

  #keyBindings;

  #previousState?: NonNullObject;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.#keyBindings = [
      new KeyBinding('ArrowLeft', () => this.#rotateLeft(), { altKey: true }),
      new KeyBinding('ArrowRight', () => this.#rotateRight(), { altKey: true }),
      new KeyBinding('ArrowUp', () => this.#rotateLeft(), { altKey: true }),
      new KeyBinding('ArrowDown', () => this.#rotateRight(), { altKey: true }),
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

  #rotateLeft() {
    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length < 2) { return; }

    if (this.#targetApp.undoStack.isEmpty() || this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    rotate(selectedBases, (-2 / 180) * Math.PI);
  }

  #rotateRight() {
    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length < 2) { return; }

    if (this.#targetApp.undoStack.isEmpty() || this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    rotate(selectedBases, (2 / 180) * Math.PI);
  }
}

type NonNullObject = { [name: string]: unknown };
