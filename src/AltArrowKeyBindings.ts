import type { RNAcanvas } from './RNAcanvas';

import { KeyBinding } from '@rnacanvas/utilities';

import { consensusValue } from '@rnacanvas/consensize';

import { rotate } from '@rnacanvas/layout';

export class AltArrowKeyBindings {
  #targetApp;

  #keyBindings;

  #previousState?: NonNullObject;

  /**
   * Time of the last arrow key event (in milliseconds).
   */
  #lastTime = 0;

  #repeatCount = 0;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.#keyBindings = [
      new KeyBinding('ArrowLeft', () => this.#handleArrowLeft(), { altKey: true }),
      new KeyBinding('ArrowRight', () => this.#handleArrowRight(), { altKey: true }),
      new KeyBinding('ArrowUp', () => this.#handleArrowUp(), { altKey: true }),
      new KeyBinding('ArrowDown', () => this.#handleArrowDown(), { altKey: true }),
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

  #handleArrowLeft() {
    this.#handleArrowKey({ key: 'ArrowLeft' });
  }

  #handleArrowRight() {
    this.#handleArrowKey({ key: 'ArrowRight' });
  }

  #handleArrowUp() {
    this.#handleArrowKey({ key: 'ArrowUp' });
  }

  #handleArrowDown() {
    this.#handleArrowKey({ key: 'ArrowDown' });
  }

  #handleArrowKey(event: { key: string }) {
    let t = Date.now();

    this.#repeatCount = t - this.#lastTime <= 250 ? this.#repeatCount + 1 : 0;
    this.#lastTime = t;

    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length == 0) { return; }

    if (this.#targetApp.undoStack.isEmpty() || this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    if (event.key === 'ArrowLeft') {
      this.#rotateLeft();
    } else if (event.key === 'ArrowRight') {
      this.#rotateRight();
    } else if (event.key === 'ArrowUp') {
      this.#rotateLeft();
    } else if (event.key === 'ArrowDown') {
      this.#rotateRight();
    }
  }

  #rotateLeft() {
    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length < 2) { return; }

    if (this.#targetApp.undoStack.isEmpty() || this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    let increment = (-2 / 180) * Math.PI;
    increment *= this.#speedUp;

    rotate(selectedBases, increment);
  }

  #rotateRight() {
    let selectedBases = [...this.#targetApp.selectedBases];
    if (selectedBases.length < 2) { return; }

    if (this.#targetApp.undoStack.isEmpty() || this.#targetApp.undoStack.peek() !== this.#previousState) {
      this.#targetApp.pushUndoStack();
      this.#previousState = this.#targetApp.undoStack.peek();
    }

    let increment = (2 / 180) * Math.PI;
    increment *= this.#speedUp;

    rotate(selectedBases, increment);
  }

  /**
   * Speed-up factor.
   */
  get #speedUp() {
    let speedUp = Math.floor(this.#repeatCount / 5) + 1;

    speedUp = Math.min(speedUp, 6);

    return speedUp
  }
}

type NonNullObject = { [name: string]: unknown };
