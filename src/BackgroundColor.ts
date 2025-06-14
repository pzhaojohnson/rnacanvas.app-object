import type { Drawing } from '@rnacanvas/draw';

/**
 * Represents the background color of a target drawing
 * as perceived by the user (e.g., with filter effects applied, etc.).
 */
export class BackgroundColor {
  #targetDrawing;

  /**
   * Used to calculate the background color of the target drawing.
   */
  #canvas = document.createElement('canvas');

  #svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  #drawingObserver;

  #eventListeners: EventListeners = {
    'change': [],
  };

  constructor(targetDrawing: Drawing) {
    this.#targetDrawing = targetDrawing;

    // make canvas area nonzero
    this.#canvas.style.width = '10px';
    this.#canvas.style.height = '10px';

    this.#svg.setAttribute('width', '10');
    this.#svg.setAttribute('height', '10');
    this.#svg.setAttribute('viewBox', '0 0 10 10');

    // don't interfere with the positioning of other elements
    this.#canvas.style.position = 'fixed';
    this.#canvas.style.left = '0px';
    this.#canvas.style.top = '0px';

    // make invisible and non-interactive
    this.#canvas.style.display = 'none';
    this.#canvas.style.pointerEvents = 'none';

    document.body.append(this.#canvas);

    this.#drawingObserver = new MutationObserver(() => this.#callEventListeners('change'));

    this.#drawingObserver.observe(targetDrawing.domNode, { attributes: true, attributeFilter: ['style'] });
  }

  /**
   * Returns true if the background color of the target drawing
   * is closer to black than it is to white.
   */
  async isDark(): Promise<boolean> {
    // it might be necessary for the canvas to be part of the document body for pixel color data to be correctly calculated
    if (!document.body.contains(this.#canvas)) {
      document.body.append(this.#canvas);
    }

    let context = this.#canvas.getContext('2d');

    // return that background color is light by default
    if (!context) {
      return false;
    }

    // use a white backdrop
    context.fillStyle = 'white';
    context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

    let computedStyle = window.getComputedStyle(this.#targetDrawing.domNode);

    // apply any CSS styles that would affect the background color perceived by the user
    this.#svg.style.backgroundColor = computedStyle.backgroundColor;
    this.#svg.style.filter = computedStyle.filter;

    // return that background color is light if any of this throws
    try {
      let serializer = new XMLSerializer();
      let xml = serializer.serializeToString(this.#svg);

      let image = new Image();
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);

      // must wait for the image to load
      await image.decode();

      context.drawImage(image, 0, 0, this.#canvas.width, this.#canvas.height);
    } catch {
      return false;
    }

    let data = context?.getImageData(0, 0, 1, 1).data;

    // return that the background color is light by default
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
