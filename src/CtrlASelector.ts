import { userIsTyping } from '@rnacanvas/utilities';

interface App {
  /**
   * The actual DOM node corresponding to the app.
   *
   * Contains all of the elements of the app.
   */
  domNode: Node;

  selectAll: () => void;
}

/**
 * Selects all when the user presses `Ctrl-A` (or `Cmd-A` on Mac)
 * when the target app has focus and the user is not currently typing.
 */
export class CtrlASelector {
  /**
   * The most recent mouse down event.
   */
  #lastMouseDown: MouseEvent | undefined;

  constructor(private targetApp: App) {
    window.addEventListener('mousedown', event => this.#lastMouseDown = event);

    window.addEventListener('keydown', event => {
      if (!(event.ctrlKey || event.metaKey)) { return; }
      if (event.key.toUpperCase() !== 'A') { return; }

      if (!this.#lastMouseDown) { return; }
      if (!(this.#lastMouseDown.target instanceof Node)) { return; }
      if (!targetApp.domNode.contains(this.#lastMouseDown.target)) { return; }

      if (userIsTyping()) { return; }

      event.preventDefault();
      targetApp.selectAll();
    }, { passive: false });
  }
}
