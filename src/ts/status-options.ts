
/**
 * Defines the structure of a status option. These are not copied. Courses with the
 * same status reference the same object on the StatusOptions class.
 */
export interface Status {
  readonly title: string; // The title of the status option used for display
  readonly match: string; // A key used to match strings to this status
  readonly color: { backgroundColor: string, borderColor: string } // styling for course divs
}

/**
 * Interface for getting status options. Status options are used to signal the different 
 * stages courses are at in the scheduling process.
 */
export class StatusOptions {
  static readonly pastSubmission: Status = {
    title: "Past Submission",
    match: "past",
    color: {
      backgroundColor: "#CFCFCF",
      borderColor: "#4F4F4F"
    }
  };

  static readonly wrongCourse: Status = {
    title: "Incorrect Course ID or Position",
    match: "incorrect",
    color: {
      backgroundColor: "#E6BBC1",
      borderColor: "#D31F38"
    }
  };

  static readonly invalidTimes: Status = {
    title: "Has Invalid Times",
    match: "invalid",
    color: {
      backgroundColor: "#E6BBC1",
      borderColor: "#D31F38"
    }
  };

  static readonly missing: Status = {
    title: "Email Not In Expected Tutors List",
    match: "expected",
    color: {
      backgroundColor: "#E6BBC1",
      borderColor: "#D31F38"
    }
  };

  static readonly errorsResolved: Status = {
    title: "All Errors Resolved",
    match: "resolved",
    color: {
      backgroundColor: "#F6FFBA",
      borderColor: "#CCDD55"
    }
  };

  static readonly inProgress: Status = {
    title: "Scheduling In Progress",
    match: "in progress",
    color: {
      backgroundColor: "#F6FFBA",
      borderColor: "#CCDD55"
    }
  };

  static readonly scheduled: Status = {
    title: "Sessions Scheduled",
    match: "scheduled",
    color: {
      backgroundColor: "#A4D0F1",
      borderColor: "#2583C7"
    }
  };

  static readonly slackNote: Status = {
    title: "Slack Note Sent",
    match: "slack",
    color: {
      backgroundColor: "#A4D0F1",
      borderColor: "#2583C7"
    }
  };

  static readonly calendarPosted: Status = {
    title: "Posted On Calendar",
    match: "calendar",
    color: {
      backgroundColor: "#E1B6F1",
      borderColor: "#9A39BD"
    }
  };

  static readonly tutorhubPosted: Status = {
    title: "Posted On TutorHub",
    match: "tutorhub",
    color: {
      backgroundColor: "#E1B6F1",
      borderColor: "#9A39BD"
    }
  };

  static readonly confirmed: Status = {
    title: "Schedule Confirmed",
    match: "confirmed",
    color: {
      backgroundColor: "#90E7BC",
      borderColor: "#23BC71"
    }
  };

  static readonly statusList: Status[] = [
    StatusOptions.pastSubmission,
    StatusOptions.wrongCourse,
    StatusOptions.invalidTimes,
    StatusOptions.missing,
    StatusOptions.errorsResolved,
    StatusOptions.inProgress,
    StatusOptions.scheduled,
    StatusOptions.slackNote,
    StatusOptions.calendarPosted,
    StatusOptions.tutorhubPosted,
    StatusOptions.confirmed,
  ];

  static getTitles(): string[] {
    const titles: string[] = [];
    StatusOptions.forEach((status) => {
      titles.push(status.title);
    });
    return titles;
  }

  static forEach(action: (status: Status) => void) {
    StatusOptions.statusList.forEach(action);
  }

  /**
   * Finds a matching status option given a string. 
   * If no matching status is found, returns the `inProgress` status.
   */
  static match(str: string): Status {
    let status = StatusOptions.inProgress;
    const lower = str.toLowerCase();
    StatusOptions.forEach((s) => {
      if (lower.includes(s.match)) {
        status = s;
      }
    });
    return status;
  }

  static readonly progressOptions: Status[] = [
    StatusOptions.errorsResolved,
    StatusOptions.inProgress
  ];

  /**
   * Returns true if the given status is considered in progress. 
   * As in it doesn't have any errors, but hasn't been given room assignments yet.
   */
  static isProgressStatus(status: Status): boolean {
    let isProgressOption = false;
    StatusOptions.progressOptions.forEach(option => {
      if (option.title === status.title) {
        isProgressOption = true;
      }
    });
    return isProgressOption;
  }

  static readonly errorOptions: Status[] = [
    StatusOptions.wrongCourse,
    StatusOptions.invalidTimes,
    StatusOptions.missing
  ];

  /**
   * Returns true if the given status is considered an error status.
   */
  static isErrorStatus(status: Status): boolean {
    let isErrorOption = false;
    StatusOptions.errorOptions.forEach(option => {
      if (option.title === status.title) {
        isErrorOption = true;
      }
    });
    return isErrorOption;
  }

  static readonly scheduledOptions: Status[] = [
    StatusOptions.scheduled,
    StatusOptions.slackNote,
    StatusOptions.calendarPosted,
    StatusOptions.tutorhubPosted,
    StatusOptions.confirmed
  ];

  /**
   * Returns true if the given status is one assigned after the course has had rooms 
   * assigned to sessions.
   */
  static isScheduledStatus(status: Status): boolean {
    let isScheduledOption = false;
    StatusOptions.scheduledOptions.forEach(option => {
      if (option.title === status.title) {
        isScheduledOption = true;
      }
    });
    return isScheduledOption;
  }
}
