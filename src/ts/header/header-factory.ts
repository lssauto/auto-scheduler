import { Header } from "./header.ts";

export class HeaderFactory {

  public static buildHeader(): Header {
    const header: Header = new Header();
    HeaderFactory.buildTutorTools(header);
    HeaderFactory.buildRoomTools(header);
    return header;
  }

  // TODO: build tools

  // Tutor tools ===========================

  private static buildTutorTools(header: Header) {
    header.addTutorTool("search", HeaderFactory.buildSearchBar());
    header.addTutorTool("filter", HeaderFactory.buildFilter());
    header.addTutorTool("copyTable", HeaderFactory.buildCopyTable());
    header.addTutorTool("copySchedules", HeaderFactory.buildCopySchedules());
  }

  private static buildSearchBar(): HTMLElement {
    return document.createElement("p");
  }

  private static buildFilter(): HTMLElement {
    return document.createElement("p");
  }

  private static buildCopyTable(): HTMLElement {
    return document.createElement("p");
  }

  private static buildCopySchedules(): HTMLElement {
    return document.createElement("p");
  }

  // Room tools ============================

  private static buildRoomTools(header: Header) {
    header.addRoomTool("copyRooms", HeaderFactory.buildCopyRooms());
    header.addRoomTool("copyRequests", HeaderFactory.buildCopyRequests());
  }

  private static buildCopyRooms(): HTMLElement {
    return document.createElement("p");
  }

  private static buildCopyRequests(): HTMLElement {
    return document.createElement("p");
  }
}
