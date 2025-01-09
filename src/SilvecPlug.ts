import * as styles from './SilvecPlug.module.css';

import $ from 'jquery';

/**
 * Silvec blurb to be included in the bottom-right corner of the app.
 */
export function SilvecPlug() {
  let domNode = document.createElement('p');

  domNode.classList.add(styles['silvec-plug']);

  let SilvecBiologics = document.createElement('span');

  $(SilvecBiologics)
    .text('Silvec Biologics')
    .css({ fontWeight: '700' });

  domNode.append(SilvecBiologics, ' - an RNA company');

  $(domNode).css({
    position: 'absolute', top: '4px', right: '80px',
    fontFamily: '"Open Sans", sans-serif', fontSize: '11px', fontWeight: '500', color: 'black',
    pointerEvents: 'none', userSelect: 'none', webkitUserSelect: 'none',
  });

  return domNode;
}
