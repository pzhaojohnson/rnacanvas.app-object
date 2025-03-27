import type { RNAcanvas } from './RNAcanvas';

import { KeyBinding } from '@rnacanvas/utilities';

import { consensusValue } from '@rnacanvas/consensize';

import { shift } from '@rnacanvas/layout';

export class ArrowKeyBindings {
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
      new KeyBinding('ArrowLeft', () => this.#handleArrowLeft()),
      new KeyBinding('ArrowRight', () => this.#handleArrowRight()),
      new KeyBinding('ArrowUp', () => this.#handleArrowUp()),
      new KeyBinding('ArrowDown', () => this.#handleArrowDown()),
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
      this.#shiftLeft();
    } else if (event.key === 'ArrowRight') {
      this.#shiftRight();
    } else if (event.key === 'ArrowUp') {
      this.#shiftUp();
    } else if (event.key === 'ArrowDown') {
      this.#shiftDown();
    }
  }

  #shiftLeft() {
    shift([...this.#targetApp.selectedBases], { x: -this.#incrementX, y: 0 });
  }

  #shiftRight() {
    shift([...this.#targetApp.selectedBases], { x: this.#incrementX, y: 0 });
  }

  #shiftUp() {
    shift([...this.#targetApp.selectedBases], { x: 0, y: -this.#incrementY });
  }

  #shiftDown() {
    shift([...this.#targetApp.selectedBases], { x: 0, y: this.#incrementY });
  }

  get #incrementX() {
    let incrementX = 2;

    incrementX /= this.#targetApp.drawing.horizontalClientScaling;

    if (this.#repeatCount / 3 >= 2) {
      incrementX *= 3;
    } else if (this.#repeatCount / 3 >= 1) {
      incrementX *= 2;
    }

    incrementX = Number.isFinite(incrementX) ? incrementX : 2;

    return incrementX;
  }

  get #incrementY() {
    let incrementY = 2;

    incrementY /= this.#targetApp.drawing.verticalClientScaling;

    if (this.#repeatCount / 3 >= 2) {
      incrementY *= 3;
    } else if (this.#repeatCount / 3 >= 1) {
      incrementY *= 2;
    }

    incrementY = Number.isFinite(incrementY) ? incrementY : 2;

    return incrementY;
  }
}

type NonNullObject = { [name: string]: unknown };
