import { isNonNullObject } from '@rnacanvas/value-check';

/**
 * Returns `true` if the saved app state is from a legacy version of the RNAcanvas app.
 *
 * Returns `false` otherwise.
 */
export function isLegacy(savedAppState: unknown): boolean {
  return (
    isNonNullObject(savedAppState)
    && isNonNullObject(savedAppState.drawing)
    && 'svg' in savedAppState.drawing
  );
}
