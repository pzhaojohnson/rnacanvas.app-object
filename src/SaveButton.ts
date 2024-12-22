import * as styles from './SaveButton.module.css';

export function SaveButton() {
  let domNode = document.createElement('button');

  domNode.classList.add(styles['save-button']);

  domNode.textContent = 'Save';

  return domNode;
}
