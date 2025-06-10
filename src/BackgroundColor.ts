import type { Drawing } from '@rnacanvas/draw';

/**
 * Represents the background color of a target drawing.
 */
export class BackgroundColor {
  #targetDrawing;

  /**
   * Used to calculate the background color of the target drawing.
   */
  #canvas = document.createElement('canvas');

  #canvasContainer = document.createElement('div');

  #drawingObserver;

  #eventListeners: EventListeners = {
    'change': [],
  };

  constructor(targetDrawing: Drawing) {
    this.#targetDrawing = targetDrawing;

    this.#canvasContainer.append(this.#canvas);

    // make canvas area nonzero
    this.#canvas.style.width = '10px';
    this.#canvas.style.height = '10px';

    // use a white backdrop
    this.#canvasContainer.style.backgroundColor = 'white';

    // don't interfere with the positioning of any other elements
    this.#canvasContainer.style.position = 'fixed';
    this.#canvasContainer.style.top = '0px';
    this.#canvasContainer.style.left = '0px';

    // make invisible and non-interactive
    this.#canvasContainer.style.display = 'none';

    document.body.append(this.#canvasContainer);

    this.#drawingObserver = new MutationObserver(() => this.#callEventListeners('change'));

    this.#drawingObserver.observe(targetDrawing.domNode, { attributes: true, attributeFilter: ['style'] });
  }

  /**
   * Returns true if the background color of the target drawing
   * is closer to black than it is to white.
   */
  isDark(): boolean {
    let computedStyle = window.getComputedStyle(this.#targetDrawing.domNode);

    // apply CSS styles that would affect the background color as perceived by the user
    this.#canvas.style.backgroundColor = computedStyle.backgroundColor;
    this.#canvas.style.filter = computedStyle.filter;

    let context = this.#canvas.getContext('2d');

    let data = context?.getImageData(0, 0, 1, 1).data;

    // treat as being light if cannot get image data
    if (!data) {
      return false;
    }

    let [r, g, b] = data;

    let luminance = 0.2126*r + 0.7152*g + 0.0722*b;

    return luminance < 255 / 2;
  }

  /**
   * Listeners might sometimes get called when the background color doesn't actually change.
   */
  addEventListener(name: 'change', listener: () => void): void {
    this.#eventListeners[name].push(listener);
  }

  removeEventListener(name: 'change', listener: () => void): void {
    this.#eventListeners[name] = this.#eventListeners[name].filter(li => li !== listener);
  }

  #callEventListeners(name: 'change'): void {
    this.#eventListeners[name].forEach(listener => listener());
  }
}

type EventListeners = {
  'change': (() => void)[];
};
