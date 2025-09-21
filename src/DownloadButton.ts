import type { RNAcanvas } from './RNAcanvas';

import * as styles from './DownloadButton.module.css';

import { detectMacOS, detectWindows } from '@rnacanvas/utilities';

export class DownloadButton {
  #targetApp;

  readonly domNode = document.createElement('div');

  #icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  #buttonsContainer;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.domNode.classList.add(styles['download-button']);

    this.#icon.setAttribute('width', '20');
    this.#icon.setAttribute('height', '22');
    this.#icon.setAttribute('viewBox', '0 -2 20 22');

    this.#icon.innerHTML = `
      <path d="M 5 10 L 10 15 L 15 10" fill="white" stroke-width="0" stroke-linecap="round" ></path>
      <line x1="10" y1="0" x2="10" y2="14" stroke="white" stroke-width="1" ></line>
      <line x1="3" y1="18" x2="17" y2="18" stroke="white" stroke-width="1" ></line>
    `;

    this.domNode.append(this.#icon);

    this.#buttonsContainer = new ButtonsContainer(targetApp);

    this.domNode.append(this.#buttonsContainer.domNode);
  }

  hide() {
    this.domNode.style.display = 'none';
  }

  show() {
    this.domNode.style.display = 'flex';
  }
}

class ButtonsContainer {
  #targetApp;

  readonly domNode = document.createElement('div');

  #rasterImageButton;
  #svgImageButton;
  #rnaCanvasFileButton;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.domNode.classList.add(styles['buttons-container']);

    this.#rasterImageButton = new RasterImageButton();
    this.#svgImageButton = new SVGImageButton(targetApp);
    this.#rnaCanvasFileButton = new RNAcanvasFileButton(targetApp);

    this.domNode.append(this.#rasterImageButton.domNode, this.#svgImageButton.domNode, this.#rnaCanvasFileButton.domNode);

    this.#rasterImageButton.domNode.style.borderRadius = '4px 4px 0px 0px';
    this.#rnaCanvasFileButton.domNode.style.borderRadius = '0px 0px 4px 4px';
  }
}

class RasterImageButton {
  /**
   * Wrapped button.
   */
  #button = new Button();

  constructor() {
    if (detectMacOS()) {
      this.#button.textContent = 'PNG: ⇧ ⌘ 4';
    } else if (detectWindows()) {
      this.#button.textContent = 'PNG: Windows key + Shift + S';
    } else {
      this.#button.textContent = 'PNG: Shift + PrtSc';
    }

    this.#button.domNode.style.pointerEvents = 'none';
    this.#button.domNode.style.cursor = 'default';
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
  #button = new Button('SVG');

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.#button.domNode.addEventListener('click', () => this.#targetApp.exportSVG());

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
  #button = new Button('.rnacanvas');

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.#button.domNode.addEventListener('click', () => this.#targetApp.save());

    this.#button.domNode.style.cursor = 'pointer';
  }

  get domNode() {
    return this.#button.domNode;
  }
}

class Button {
  readonly domNode = document.createElement('p');

  constructor(textContent?: string) {
    this.domNode.classList.add(styles['button']);

    this.domNode.textContent = textContent ?? '';
  }

  get textContent() {
    return this.domNode.textContent;
  }

  set textContent(textContent) {
    this.domNode.textContent = textContent;
  }
}
