import type { Drawing } from '@rnacanvas/draw';

import type { HorizontalScrollbar, VerticalScrollbar } from '@rnacanvas/scrollbars';

import { Point, isFinitePoint } from '@rnacanvas/points';

import { isNonNullObject } from '@rnacanvas/value-check';

/**
 * Represents the user's view of a target drawing.
 */
export class DrawingView {
  private targetDrawing: Drawing;

  private horizontalScrollbar: HorizontalScrollbar;

  private verticalScrollbar: VerticalScrollbar;

  /**
   * Horizontal and vertical scrollbars are expected to match the target drawing perfectly.
   *
   * For instance, shifting the horizontal scrollbar all the way to the left
   * should correspond with the leftmost boundary of the target drawing,
   * shifting the vertical scrollbar all the way down
   * should correspond with the bottommost boundary of the target drawing, etc.
   *
   * There should be no extra space surrounding the target drawing that can be scrolled to.
   *
   * @param targetDrawing
   * @param horizontalScrollbar The horizontal scrollbar for the target drawing.
   * @param verticalScrollbar The vertical scrollbar for the target drawing.
   */
  constructor(targetDrawing: Drawing, horizontalScrollbar: HorizontalScrollbar, verticalScrollbar: VerticalScrollbar) {
    this.targetDrawing = targetDrawing;
    this.horizontalScrollbar = horizontalScrollbar;
    this.verticalScrollbar = verticalScrollbar;
  }

  /**
   * Returns the center point of the user's view of the target drawing in drawing coordinates
   * (i.e., in the coordinate system of the target drawing).
   */
  get centerPoint(): Point {
    return {
      x: (this.horizontalScrollbar.thumb.centerX / this.targetDrawing.horizontalScaling) + this.targetDrawing.minX,
      y: (this.verticalScrollbar.thumb.centerY / this.targetDrawing.verticalScaling) + this.targetDrawing.minY,
    };
  }

  set centerPoint(centerPoint) {
    this.horizontalScrollbar.thumb.centerX = this.targetDrawing.horizontalScaling * (centerPoint.x - this.targetDrawing.minX);
    this.verticalScrollbar.thumb.centerY = this.targetDrawing.verticalScaling * (centerPoint.y - this.targetDrawing.minY);
  }

  /**
   * Fits the user's view of the target drawing to its content.
   */
  fitToContent(): void {
    let contentBBox = this.targetDrawing.contentBBox;

    // make scaling a little smaller than necessary
    // (to make visible some extra space around the drawing content)
    this.targetDrawing.setScaling(
      0.9 * Math.min(
        this.horizontalScrollbar.thumb.length / contentBBox.width,
        this.verticalScrollbar.thumb.length / contentBBox.height,
      )
    );

    this.centerPoint = {
      x: contentBBox.x + (contentBBox.width / 2),
      y: contentBBox.y + (contentBBox.height / 2),
    };
  }

  /**
   * Returns the serialized form of the drawing view.
   */
  serialized() {
    return {
      centerPoint: this.centerPoint,
    };
  }

  /**
   * Restores a previous state of the drawing view.
   */
  restore(previousState: unknown): void | never {
    if (!isNonNullObject(previousState)) { throw new Error('Previous state must be an object.'); }

    if (isFinitePoint(previousState.centerPoint)) {
      this.centerPoint = previousState.centerPoint;
    }
  }
}
