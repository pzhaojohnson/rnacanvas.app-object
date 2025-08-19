import * as styles from './SilvecPlug.module.css';

import $ from 'jquery';

/**
 * Silvec blurb to be included in the bottom-right corner of the app.
 */
export class SilvecPlug{
  readonly domNode;

  constructor() {
    this.domNode = document.createElement('p');

    this.domNode.classList.add(styles['silvec-plug']);

    let SilvecBiologics = document.createElement('span');

    $(SilvecBiologics)
      .text('Silvec Biologics')
      .css({ fontWeight: '700' });

    this.domNode.append(SilvecBiologics, ' - an RNA company');

    $(this.domNode).css({
      position: 'absolute', top: '4px', right: '80px',
      fontFamily: '"Open Sans", sans-serif', fontSize: '11px', fontWeight: '500', color: 'black',
      pointerEvents: 'none', userSelect: 'none', webkitUserSelect: 'none',
    });
  }

  hide(): void {
    this.domNode.style.visibility = 'hidden';
  }

  show(): void {
    this.domNode.style.visibility = '';
  }
}
