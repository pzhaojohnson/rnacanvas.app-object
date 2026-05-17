export interface Form {
  /**
   * The DOM node corresponding to the form.
   */
  readonly domNode: HTMLElement;

  /**
   * To be called prior to opening a form (if this method is present).
   */
  refresh?(): void;

  /**
   * Undoes any dragging of the form by the user.
   *
   * To be called prior to opening a form (if this method is present).
   */
  reposition?(): void;
}
