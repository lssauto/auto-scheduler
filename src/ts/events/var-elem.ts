import { NotifyEvent } from "./notify";

export class VariableElement {
  element: HTMLElement;
  event: NotifyEvent;
  updateAction: () => void;

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
