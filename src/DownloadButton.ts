import type { RNAcanvas } from './RNAcanvas';

import * as styles from './DownloadButton.module.css';

import { detectMacOS, detectWindows } from '@rnacanvas/utilities';

export class DownloadButton {
  #targetApp;

  readonly domNode = document.createElement('div');

  #icon = new Icon();

  #imageFormatButtons;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.domNode.classList.add(styles['download-button']);

    this.domNode.append(this.#icon.domNode);

    this.#imageFormatButtons = new ImageFormatButtons(targetApp);

    this.domNode.append(this.#imageFormatButtons.domNode);

    targetApp.domNode.addEventListener('click', event => {
      if (!(event.target instanceof Node)) {
        // nothing to do
      } else if (!this.domNode.contains(event.target)) {
        this.#imageFormatButtons.hide();
      } else if (this.#icon.domNode.contains(event.target)) {
        this.#imageFormatButtons.isHidden() ? this.#imageFormatButtons.show() : this.#imageFormatButtons.hide();
      }
    });
  }

  hide() {
    this.domNode.style.display = 'none';
  }

  show() {
    this.domNode.style.display = 'flex';
  }
}

class Icon {
  readonly domNode = document.createElement('div');

  #svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  constructor() {
    this.domNode.classList.add(styles['icon']);

    this.#svg.setAttribute('width', '20');
    this.#svg.setAttribute('height', '22');
    this.#svg.setAttribute('viewBox', '0 -2 20 22');

    this.#svg.innerHTML = `
      <path d="M 5 10 L 10 15 L 15 10" fill="white" stroke-width="0" stroke-linecap="round" ></path>
      <line x1="10" y1="0" x2="10" y2="14" stroke="white" stroke-width="1" ></line>
      <line x1="3" y1="18" x2="17" y2="18" stroke="white" stroke-width="1" ></line>
    `;

    this.domNode.append(this.#svg);
  }
}

class ImageFormatButtons {
  #targetApp;

  readonly domNode = document.createElement('div');

  #rasterImageButton;
  #svgImageButton;
  #rnaCanvasFileButton;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.domNode.classList.add(styles['image-format-buttons']);

    // hide by default
    this.domNode.style.display = 'none';

    this.#rasterImageButton = new RasterImageButton();
    this.#rasterImageButton.domNode.style.borderRadius = '4px 4px 0px 0px';
    this.domNode.append(this.#rasterImageButton.domNode);

    this.domNode.append((new Spacer()).domNode);

    this.#svgImageButton = new SVGImageButton(targetApp);
    this.domNode.append(this.#svgImageButton.domNode);

    this.domNode.append((new Spacer()).domNode);

    this.#rnaCanvasFileButton = new RNAcanvasFileButton(targetApp);
    this.#rnaCanvasFileButton.domNode.style.borderRadius = '0px 0px 4px 4px';
    this.domNode.append(this.#rnaCanvasFileButton.domNode);
  }

  hide() {
    this.domNode.style.display = 'none';
  }

  isHidden(): boolean {
    return this.domNode.style.display == 'none';
  }

  show() {
    this.domNode.style.display = 'flex';
  }
}

class RasterImageButton {
  /**
   * Wrapped button.
   */
  #button = new ImageFormatButton();

  constructor() {
    if (detectMacOS()) {
      this.#button.text = 'Screen Capture';
      this.#button.keyBinding = '⇧ ⌘ 4';
    } else if (detectWindows()) {
      this.#button.text = 'Snipping Tool';
      this.#button.keyBinding = 'Windows key + Shift + S';
    } else {
      // assume Linux
      this.#button.text = 'Screenshot';
      this.#button.keyBinding = 'Shift + PrtSc';
    }

    this.#button.textColor = '#cfcfde';

    this.#button.domNode.style.cursor = 'default';

    // prevent background color from changing on hover and click
    this.#button.domNode.style.backgroundColor = 'transparent';
  }

  get domNode() {
    return this.#button.domNode;
  }
}

class SVGImageButton {
  #targetApp;

  /**
   * Wrapped button.
   */
  #button = new ImageFormatButton('SVG');

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.#button.domNode.addEventListener('click', () => this.#targetApp.exportSVG());

    this.#button.keyBinding = 'E';

    this.#button.domNode.style.cursor = 'pointer';
  }

  get domNode() {
    return this.#button.domNode;
  }
}

class RNAcanvasFileButton {
  #targetApp;

  /**
   * Wrapped button.
   */
  #button = new ImageFormatButton('.rnacanvas');

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.#button.domNode.addEventListener('click', () => this.#targetApp.save());

    if (detectMacOS()) {
      this.#button.keyBinding = '⌘ S';
    } else {
      this.#button.keyBinding = 'Ctrl + S';
    }

    this.#button.domNode.style.cursor = 'pointer';
  }

  get domNode() {
    return this.#button.domNode;
  }
}

class ImageFormatButton {
  readonly domNode = document.createElement('div');

  #text = document.createElement('p');

  #spacer = document.createElement('div');

  #keyBinding = document.createElement('p');

  constructor(text?: string) {
    this.domNode.classList.add(styles['image-format-button']);

    this.text = text ?? '';

    this.#text.classList.add(styles['image-format-button-text']);
    this.#text.style.marginRight = '17px';
    this.domNode.append(this.#text);

    this.#spacer.style.flexGrow = '1';
    this.domNode.append(this.#spacer);

    this.#keyBinding.classList.add(styles['image-format-button-text']);
    this.domNode.append(this.#keyBinding);
  }

  get text() {
    return this.#text.textContent;
  }

  set text(text) {
    this.#text.textContent = text;
  }

  /**
   * CSS color value.
   */
  get textColor() {
    return this.#text.style.color;
  }

  set textColor(textColor) {
    this.#text.style.color = textColor;
  }

  get keyBinding() {
    // don't forget to omit leading and trailing brackets
    return this.#keyBinding.textContent.slice(2, -2);
  }

  set keyBinding(keyBinding) {
    if (keyBinding) {
      this.#keyBinding.textContent = `[ ${keyBinding} ]`;
    } else {
      this.#keyBinding.textContent = '';
    }
  }
}

class Spacer {
  readonly domNode = document.createElement('div');

  #whiteLine = document.createElement('div');

  constructor() {
    this.domNode.classList.add(styles['spacer']);

    this.#whiteLine.style.backgroundColor = '#c1c1d3';
    this.#whiteLine.style.height = '1px';
  }
}
