import { userIsTyping } from '@rnacanvas/utilities';

interface App {
  hasFocus(): boolean;

  selectAll: () => void;
}

/**
 * Selects all when the user presses `Ctrl-A` (or `Cmd-A` on Mac)
 * when the target app has focus and the user is not currently typing.
 */
export class CtrlASelector {
  constructor(private targetApp: App) {
    window.addEventListener('keyup', event => {
      if (!(event.ctrlKey || event.metaKey)) { return; }
      if (event.key.toUpperCase() !== 'A') { return; }
      if (userIsTyping()) { return; }
      if (!targetApp.hasFocus()) { return; }

      event.preventDefault();
      targetApp.selectAll();
    });
  }
}
