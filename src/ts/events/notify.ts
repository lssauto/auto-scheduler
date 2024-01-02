export type Notify = (event: object) => void;

export interface NotifyListener {
  subscriber: object;
  action: Notify;
}

export class NotifyEvent {
  readonly name: string;
  private listeners: NotifyListener[];
  constructor(name: string) {
    this.name = name;
    this.listeners = [];
  }

  addListener(subscriber: object, action: Notify) {
    for (const listener of this.listeners) {
      if (listener.subscriber === subscriber) {
        listener.action = action;
        return;
      }
    }
    this.listeners.push({ subscriber: subscriber, action: action });
  }

  removeListener(subscriber: object) {
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].subscriber === subscriber) {
        this.listeners.splice(i, 1);
        return;
      }
    }
  }

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
