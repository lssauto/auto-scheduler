import { Rooms } from "../../rooms/rooms.ts";
import { ResponseTableMaker } from "../../table-makers/response-maker.ts";
import { ScheduleTableMaker } from "../../table-makers/schedule-maker.ts";
import { Tutors } from "../../tutors/tutors.ts";
import { Content } from "../content/content.ts";
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
    const container = document.createElement("div");

    const searchBar = document.createElement("input");
    searchBar.width = 12;

    const button = document.createElement("button");
    button.innerHTML = "Search";
    button.addEventListener("click", () => {
      const result = Tutors.instance!.match(searchBar.value);
      if (result) {
        Content.instance!.scrollTo(result);
        return;
      }

      const target = searchBar.value.toLowerCase();
      Tutors.instance!.filter({
        title: "Search For Course",
        include: (tutor) => {
          let match = false;
          tutor.forEachCourse((course) => {
            if (course.id.toLowerCase().includes(target)) {
              match = true;
            }
          });
          return match;
        }
      });
    });

    container.append(searchBar);
    container.append(button);

    return container;
  }

  private static buildFilter(): HTMLElement {
    const filter = document.createElement("select");
    filter.style.display = "inline-block";

    Tutors.instance!.addFilterListener(filter, () => {
      filter.innerHTML = "";
      Tutors.instance!.forEachFilter((option) => {
        const optionElem = document.createElement("option");
        optionElem.value = option.title;
        optionElem.innerHTML = option.title;
        filter.append(optionElem);
      });
    });
    Tutors.instance!.forEachFilter((option) => {
      const optionElem = document.createElement("option");
      optionElem.value = option.title;
      optionElem.innerHTML = option.title;
      filter.append(optionElem);
    });
    filter.value = Tutors.instance!.curFilter.title;

    filter.addEventListener("change", () => {
      Tutors.instance!.filter(Tutors.instance!.findFilter(filter.value)!);
    });

    const title = document.createElement("b");
    title.style.display = "inline-block";
    title.style.marginRight = "2px";
    title.innerHTML = "Filter:";

    const container = document.createElement("div");
    container.append(title);
    container.append(filter);

    return container;
  }

  private static buildCopyTable(): HTMLElement {
    const button = document.createElement("button");
    button.innerHTML = "Copy Response Table";
    button.addEventListener("click", () => {
      ResponseTableMaker.instance!.copyResponseTable();
    });

    return button;
  }

  private static buildCopySchedules(): HTMLElement {
    const button = document.createElement("button");
    button.innerHTML = "Copy Schedules";
    button.addEventListener("click", () => {
      ScheduleTableMaker.copyTutorSchedules();
    });

    return button;
  }

  // Room tools ============================

  private static buildRoomTools(header: Header) {
    header.addRoomTool("filterRooms", HeaderFactory.buildRoomFilters());
    header.addRoomTool("copyRooms", HeaderFactory.buildCopyRooms());
    header.addRoomTool("copyRequests", HeaderFactory.buildCopyRequests());
  }

  private static buildRoomFilters(): HTMLElement {
    const filter = document.createElement("select");
    filter.style.display = "inline-block";

    Rooms.instance!.addFilterListener(filter, () => {
      filter.innerHTML = "";
      Rooms.instance!.forEachFilter((option) => {
        const optionElem = document.createElement("option");
        optionElem.value = option.title;
        optionElem.innerHTML = option.title;
        filter.append(optionElem);
      });
      filter.value = Rooms.instance!.curFilter.title;
    });
    Rooms.instance!.forEachFilter((option) => {
      const optionElem = document.createElement("option");
      optionElem.value = option.title;
      optionElem.innerHTML = option.title;
      filter.append(optionElem);
    });
    filter.value = Rooms.instance!.curFilter.title;

    filter.addEventListener("change", () => {
      Rooms.instance!.filter(Rooms.instance!.findFilter(filter.value)!);
    });

    const title = document.createElement("b");
    title.style.display = "inline-block";
    title.style.marginRight = "2px";
    title.innerHTML = "Filter:";

    const container = document.createElement("div");
    container.append(title);
    container.append(filter);

    return container;
  }

  private static buildCopyRooms(): HTMLElement {
    const button = document.createElement("button");
    button.innerHTML = "Copy Schedules";
    button.addEventListener("click", () => {
      ScheduleTableMaker.copyRoomSchedules();
    });

    return button;
  }

  private static buildCopyRequests(): HTMLElement {
    const button = document.createElement("button");
    button.innerHTML = "Copy Request Rooms";
    button.addEventListener("click", () => {
      ScheduleTableMaker.copyRequestRoomSchedules();
    });

    return button;
  }
}
