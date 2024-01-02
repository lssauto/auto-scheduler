export interface MessageType {
  title: string;
  color: {backgroundColor: string, borderColor: string};
}

export class Messages {

  // # Message Types ==============================

  public static error: MessageType = {
    title: "Error",
    color: {
      backgroundColor: "#E6BBC1",
      borderColor: "#D31F38"
    }
  };

  public static warn: MessageType = {
    title: "Warning",
    color: {
      backgroundColor: "#F6FFBA",
      borderColor: "#CCDD55"
    }
  };

  public static info: MessageType = {
    title: "Info",
    color: {
      backgroundColor: "#A4D0F1",
      borderColor: "#2583C7"
    }
  };

  public static success: MessageType = {
    title: "Success",
    color: {
      backgroundColor: "#90E7BC",
      borderColor: "#23BC71"
    }
  };

  public static msg: MessageType = {
    title: "Message",
    color: {
      backgroundColor: "#CFCFCF",
      borderColor: "#4F4F4F"
    }
  };

  // # ============================================

  private static _instance: Messages | null = null;
  public static get instance(): Messages | null {
    return Messages._instance;
  }

  private _div: HTMLDivElement;
  private _messageBoard: HTMLDivElement;

  constructor() {
    if (Messages._instance !== null && Messages._instance !== this) {
      console.error("Singleton Messages class instantiated twice");
    }
    Messages._instance = this;

    this._div = this.buildDiv();
    this._messageBoard = this.buildMessageBoard();
    this._div.append(this._messageBoard);

    const body = document.getElementById("body")!;
    body.append(this._div);
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.backgroundColor = "#fafafa";
    div.style.width = "30%";
    div.style.height = "95%";
    div.style.right = "0px";
    div.style.top = "55px";
    div.style.borderLeft = "1px solid black";
    div.style.padding = "5px";

    const title = document.createElement("h3");
    title.innerHTML = "Console:";
    div.append(title);

    const clear = document.createElement("button");
    clear.innerHTML = "Clear Messages";
    clear.style.margin = "3px";
    clear.addEventListener("click", () => {
      Messages.clear();
    });
    div.append(clear);

    return div;
  }

  private buildMessageBoard(): HTMLDivElement {
    const div = document.createElement("div");
    div.style.height = "85%";
    div.style.width = "95%";
    div.style.borderTop = "1px solid black";
    div.style.overflowY = "auto";
    return div;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static output(type: MessageType, msg: any) {
    const message = document.createElement("p");
    message.style.padding = "5px";
    message.style.backgroundColor = type.color.backgroundColor;
    message.style.border = "1px solid " + type.color.borderColor;
    message.style.borderRadius = "3px";

    message.innerHTML = "<b>" + type.title + ":</b></br>";

    if (typeof msg === "string") {
      message.innerHTML += msg;
    } else {
      for (const key in msg) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        message.innerHTML += `${key}: ${msg[key]}</br>`;
      }
    }

    this.instance!._messageBoard.append(message);
  }

  static clear() {
    this.instance!._messageBoard.innerHTML = "";
  }
}
