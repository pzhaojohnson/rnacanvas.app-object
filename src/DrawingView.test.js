import { DrawingView } from './DrawingView';

class DrawingMock {
  horizontalScaling = 1;
  verticalScaling = 1;

  setScaling(scaling) {
    this.horizontalScaling = scaling;
    this.verticalScaling = scaling;
  }

  contentBBox = { x: 0, y: 0, width: 0, height: 0 };
}

describe('DrawingView class', () => {
  test('centerPoint getter', () => {
    let targetDrawing = { horizontalScaling: 0.78, verticalScaling: 1.63 };

    let horizontalScrollbar = { thumb: { centerX: 982 } };
    let verticalScrollbar = { thumb: { centerY: 1002 } };

    let drawingView = new DrawingView(targetDrawing, horizontalScrollbar, verticalScrollbar);

    expect(drawingView.centerPoint.x).toBeCloseTo(982 / 0.78);
    expect(drawingView.centerPoint.y).toBeCloseTo(1002 / 1.63);
  });

  test('centerPoint setter', () => {
    let targetDrawing = { horizontalScaling: 1.887, verticalScaling: 2.52 };

    let horizontalScrollbar = { thumb: { centerX: 0 } };
    let verticalScrollbar = { thumb: { centerY: 0 } };

    let drawingView = new DrawingView(targetDrawing, horizontalScrollbar, verticalScrollbar);

    drawingView.centerPoint = { x: -282.4, y: 5086 };

    expect(horizontalScrollbar.thumb.centerX).toBeCloseTo(1.887 * (-282.4));
    expect(verticalScrollbar.thumb.centerY).toBeCloseTo(2.52 * 5086);
  });

  describe('fitToContent method', () => {
    let targetDrawing = null;

    let horizontalScrollbar = null;
    let verticalScrollbar = null;

    let drawingView = null;

    beforeEach(() => {
      targetDrawing = new DrawingMock();

      horizontalScrollbar = { thumb: { centerX: 0, length: 0 } };
      verticalScrollbar = { thumb: { centerY: 0, length: 0 } };

      drawingView = new DrawingView(targetDrawing, horizontalScrollbar, verticalScrollbar);
    });

    test('when the content width determines how the target drawing should be scaled', () => {
      targetDrawing.contentBBox = { x: -82, y: 288, width: 3442, height: 2000 };

      horizontalScrollbar.thumb.length = 2566;
      verticalScrollbar.thumb.length = 2250;

      drawingView.fitToContent();

      expect(targetDrawing.horizontalScaling).toBeCloseTo(0.9 * 2566 / 3442);
      expect(targetDrawing.verticalScaling).toBeCloseTo(0.9 * 2566 / 3442);

      // must account for the new scaling of the target drawing
      expect(horizontalScrollbar.thumb.centerX).toBeCloseTo((0.9 * 2566 / 3442) * (((-82) + 3442) / 2));
      expect(verticalScrollbar.thumb.centerY).toBeCloseTo((0.9 * 2566 / 3442) * ((288 + 2000) / 2));
    });

    test('when the content height determines how the target drawing should be scaled', () => {
      targetDrawing.contentBBox = { x: 82, y: 124, width: 3180, height: 2210 };

      horizontalScrollbar.thumb.length = 3000;
      verticalScrollbar.thumb.length = 1973;

      drawingView.fitToContent();

      expect(targetDrawing.horizontalScaling).toBeCloseTo(0.9 * 1973 / 2210);
      expect(targetDrawing.verticalScaling).toBeCloseTo(0.9 * 1973 / 2210);

      // must account for the new scaling of the target drawing
      expect(horizontalScrollbar.thumb.centerX).toBeCloseTo((0.9 * 1973 / 2210) * ((82 + 3180) / 2));
      expect(verticalScrollbar.thumb.centerY).toBeCloseTo((0.9 * 1973 / 2210) * ((124 + 2210) / 2));
    });
  });
});
