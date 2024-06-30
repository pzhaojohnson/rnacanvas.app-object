/**
 * Automatically brings to the front (i.e., reappends to the forms container)
 * forms that are moused down on.
 */
export class FormsFronter {
  /**
   * @param formsContainer Contains the target forms.
   */
  constructor(private formsContainer: Node) {
    this.formsContainer.addEventListener('mousedown', event => {
      let targetForm = this.#targetForm(event);
      targetForm ? this.#bringToFront(targetForm) : {};
    });
  }

  /**
   * Returns the form that the event took place in
   * or `undefined` if the event did not take place in a form.
   */
  #targetForm(event: Event): Node | undefined {
    if (!(event.target instanceof Node)) { return undefined; }

    let eventTarget = event.target;

    let forms = [...this.formsContainer.childNodes];
    return forms.find(form => eventTarget === form || form.contains(eventTarget));
  }

  #bringToFront(form: Node): void {
    this.formsContainer.appendChild(form);
  }
}
