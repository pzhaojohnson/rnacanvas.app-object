import type { RNAcanvas } from './RNAcanvas';

import * as styles from './DownloadButton.module.css';

import { detectMacOS, detectWindows } from '@rnacanvas/utilities';

export class DownloadButton {
  #targetApp;

  readonly domNode = document.createElement('div');

  #icon = new Icon();

  #buttonsContainer;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.domNode.classList.add(styles['download-button']);

    this.domNode.append(this.#icon.domNode);

    this.#buttonsContainer = new ButtonsContainer(targetApp);

    this.domNode.append(this.#buttonsContainer.domNode);

    targetApp.domNode.addEventListener('click', event => {
      if (!(event.target instanceof Node)) {
        // nothing to do
      } else if (!this.domNode.contains(event.target)) {
        this.#buttonsContainer.hide();
      } else if (this.#icon.domNode.contains(event.target)) {
        this.#buttonsContainer.isHidden() ? this.#buttonsContainer.show() : this.#buttonsContainer.hide();
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

class ButtonsContainer {
  #targetApp;

  readonly domNode = document.createElement('div');

  #rasterImageButton;
  #svgImageButton;
  #rnaCanvasFileButton;

  constructor(targetApp: RNAcanvas) {
    this.#targetApp = targetApp;

    this.domNode.classList.add(styles['buttons-container']);

    // hide by default
    this.domNode.style.display = 'none';

    this.#rasterImageButton = new RasterImageButton();
    this.#svgImageButton = new SVGImageButton(targetApp);
    this.#rnaCanvasFileButton = new RNAcanvasFileButton(targetApp);

    this.domNode.append(this.#rasterImageButton.domNode, this.#svgImageButton.domNode, this.#rnaCanvasFileButton.domNode);

    this.#rasterImageButton.domNode.style.borderRadius = '4px 4px 0px 0px';
    this.#rnaCanvasFileButton.domNode.style.borderRadius = '0px 0px 4px 4px';
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
  #button = new Button('PNG');

  constructor() {
    if (detectMacOS()) {
      this.#button.keyBinding = '⇧ ⌘ 4';
    } else if (detectWindows()) {
      this.#button.keyBinding = 'Windows key + Shift + S';
    } else {
      this.#button.keyBinding = 'Shift + PrtSc';
    }

    this.#button.domNode.style.cursor = 'default';

    // prevent background color from changing on hover and click
    this.#button.domNode.style.backgroundColor = 'black';
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
  #button = new Button('SVG', 'E');

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

class Button {
  readonly domNode = document.createElement('div');

  #text = document.createElement('p');

  #spacer = document.createElement('div');

  #keyBinding = document.createElement('p');

  constructor(textContent?: string, keyBinding?: string) {
    this.domNode.classList.add(styles['button']);

    this.#text.classList.add(styles['button-text']);
    this.#text.textContent = textContent ?? '';
    this.#text.style.marginRight = '15px';
    this.domNode.append(this.#text);

    this.#spacer.style.flexGrow = '1';
    this.domNode.append(this.#spacer);

    this.#keyBinding.classList.add(styles['button-text']);
    this.#keyBinding.textContent = keyBinding ? `[ ${keyBinding} ]` : '';
    this.domNode.append(this.#keyBinding);
  }

  get textContent() {
    return this.#text.textContent;
  }

  set textContent(textContent) {
    this.#text.textContent = textContent;
  }

  get keyBinding() {
    return this.#keyBinding.textContent;
  }

  set keyBinding(keyBinding) {
    if (keyBinding) {
      this.#keyBinding.textContent = `[ ${keyBinding} ]`;
    } else {
      this.#keyBinding.textContent = '';
    }
  }
}
