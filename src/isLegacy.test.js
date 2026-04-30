import { isLegacy } from './isLegacy';

test('`function isLegacy()`', () => {
  // outer XML used to be saved under the `svg` tag
  expect(isLegacy({
    drawing: {
      svg: '<svg></svg>',
    },
  })).toBe(true);

  expect(isLegacy({
    drawing: {
      outerXML: '<svg></svg>',
    },
  })).toBe(false);
});
