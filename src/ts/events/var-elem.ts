import { NotifyEvent } from "./notify";

/**
 * Use to create reactive HTML elements. Use the update action to 
 * rebuild its contents when a given event is dispatched.
 */
export class VariableElement {
  element: HTMLElement;
  event: NotifyEvent;
  updateAction: () => void;

  /**
   * Use to create reactive HTML elements. Use the update action to 
   * rebuild its contents when a given event is dispatched.
   * The update action will be called once on instantiation to initially construct the element's contents.
   * @param element The HTML element that is being made reactive.
   * @param event The event this element should update to when dispatched.
   * @param updateAction The function that will be run to update the contents of the element.
   */
  constructor(
    element: HTMLElement,
    event: NotifyEvent,
    updateAction: () => void
  ) {
    this.element = element;
    this.event = event;
    this.updateAction = updateAction;
    this.event.addListener(this, this.updateAction);
    this.updateAction();
  }

  destroy() {
    this.element.remove();
    this.event.removeListener(this);
  }
}
