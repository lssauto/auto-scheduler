
/**
 * Function prototype for NotifyEvent event listeners.
 */
export type Notify = (event: object) => void;

/**
 * Associates an object to its event listener. Used by NotifyEvents to track 
 * which objects are in its subscriber list.
 */
export interface NotifyListener {
  subscriber: object;
  action: Notify;
}

/**
 * Event bus for tracking event subscribers, and dispatching events to those subscribers 
 * through provided event listener functions. Will not allow duplicate subscribers.
 */
export class NotifyEvent {
  readonly name: string;
  private listeners: NotifyListener[];
  constructor(name: string) {
    this.name = name;
    this.listeners = [];
  }

  /**
   * Adds a subscriber and its event listener to the subscriber list. If the given subscriber 
   * already exists in the subscriber list, then its current listener function will be 
   * replaced with the new provided `action` argument.
   */
  addListener(subscriber: object, action: Notify) {
    for (const listener of this.listeners) {
      if (listener.subscriber === subscriber) {
        listener.action = action;
        return;
      }
    }
    this.listeners.push({ subscriber: subscriber, action: action });
  }

  /**
   * Removes the subscriber from this event's subscriber list. 
   * The event listener function associated with this subscriber will no longer be called 
   * when this event in dispatched.
   */
  removeListener(subscriber: object) {
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].subscriber === subscriber) {
        this.listeners.splice(i, 1);
        return;
      }
    }
  }

  /**
   * Dispatch this event. This will call all of the event listener functions on this event.
   * @param event An object associated with this event.
   */
  dispatch(event: object) {
    for (let i = 0; i < this.listeners.length; i++) {
      const curListener = this.listeners[i];
      this.listeners[i].action(event);
      if (curListener !== this.listeners[i]) {
        i--;
      }
    }
  }
}
