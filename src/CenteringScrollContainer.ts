import { HorizontalScrollbar, VerticalScrollbar } from '@rnacanvas/scrollbars';

import { Scrollbars } from '@rnacanvas/scrollbars';

/**
 * A container that permits scrolling of its contents when its contents are larger than it
 * and that centers its contents when its contents are smaller than it.
 */
export class CenteringScrollContainer {
  /**
   * The actual DOM node corresponding to the container.
   *
   * Can be moved around within the DOM tree,
   * though its internal contents are not meant
   * to be directly edited by outside code.
   */
  readonly domNode: HTMLDivElement;

  /**
   * Is to hold the actual content of the container.
   */
  private readonly contentContainer: HTMLDivElement;

  readonly horizontalScrollbar: HorizontalScrollbar;
  readonly verticalScrollbar: VerticalScrollbar;

  readonly scrollbars: Scrollbars;

  constructor() {
    this.domNode = document.createElement('div');
    this.domNode.style.overflow = 'auto';

    let topRow = document.createElement('div');
    let middleRow = document.createElement('div');
    let bottomRow = document.createElement('div');

    topRow.style.flexGrow = '1';
    middleRow.style.flexGrow = '0';
    bottomRow.style.flexGrow = '1';

    this.domNode.style.display = 'flex';
    this.domNode.style.flexDirection = 'column';
    this.domNode.append(topRow, middleRow, bottomRow);

    let leftColumn = document.createElement('div');
    let middleColumn = document.createElement('div');
    let rightColumn = document.createElement('div');

    leftColumn.style.flexGrow = '1';
    middleColumn.style.flexGrow = '0';
    rightColumn.style.flexGrow = '1';

    middleRow.style.display = 'flex';
    middleRow.style.flexDirection = 'row';
    middleRow.append(leftColumn, middleColumn, rightColumn);

    let middleTopRow = document.createElement('div');
    this.contentContainer = document.createElement('div');
    let middleBottomRow = document.createElement('div');

    middleTopRow.style.flexGrow = '1';
    this.contentContainer.style.flexGrow = '0';
    middleBottomRow.style.flexGrow = '1';

    middleColumn.style.display = 'flex';
    middleColumn.style.flexDirection = 'column';
    middleColumn.append(middleTopRow, this.contentContainer, middleBottomRow);

    this.horizontalScrollbar = new HorizontalScrollbar(this.domNode);
    this.verticalScrollbar = new VerticalScrollbar(this.domNode);

    this.scrollbars = new Scrollbars(this.domNode);
  }

  appendTo(container: Node): void {
    container.appendChild(this.domNode);
  }

  remove(): void {
    this.domNode.remove();
  }

  /**
   * Appends the provided node to the container.
   */
  append(node: Node): void {
    this.contentContainer.append(node);
  }

  get style() {
    return this.domNode.style;
  }
}
