export interface Status {
  readonly title: string;
  readonly match: string;
}

export class StatusOptions {
  static readonly pastSubmission: Status = {
    title: "Past Submission",
    match: "past",
  };

  static readonly wrongCourse: Status = {
    title: "Incorrect Course ID or Position",
    match: "incorrect",
  };

  static readonly hasConflict: Status = {
    title: "Has Conflicts",
    match: "conflicts",
  };

  static readonly missing: Status = {
    title: "Email Not In Expected Tutors List",
    match: "expected",
  };

  static readonly errorsResolved: Status = {
    title: "All Errors Resolved",
    match: "resolved",
  };

  static readonly inProgress: Status = {
    title: "Scheduling In Progress",
    match: "in progress",
  };

  static readonly scheduled: Status = {
    title: "Sessions Scheduled",
    match: "scheduled",
  };

  static readonly slackNote: Status = {
    title: "Slack Note Sent",
    match: "slack",
  };

  static readonly calendarPosted: Status = {
    title: "Posted On Calendar",
    match: "calendar",
  };

  static readonly tutorhubPosted: Status = {
    title: "Posted On TutorHub",
    match: "tutorhub",
  };

  static readonly confirmed: Status = {
    title: "Schedule Confirmed",
    match: "confirmed",
  };

  static readonly statusList: Status[] = [
    StatusOptions.pastSubmission,
    StatusOptions.wrongCourse,
    StatusOptions.hasConflict,
    StatusOptions.missing,
    StatusOptions.errorsResolved,
    StatusOptions.inProgress,
    StatusOptions.scheduled,
    StatusOptions.slackNote,
    StatusOptions.calendarPosted,
    StatusOptions.tutorhubPosted,
    StatusOptions.confirmed,
  ];

  static forEach(action: (status: Status) => void) {
    StatusOptions.statusList.forEach(action);
  }

  static match(str: string): Status {
    let status = StatusOptions.inProgress;
    StatusOptions.forEach((s) => {
      if (str.includes(s.match)) {
        status = s;
      }
    });
    return status;
  }

  static readonly progressOptions: Status[] = [
    StatusOptions.errorsResolved,
    StatusOptions.inProgress
  ];

  static isProgressOption(status: Status): boolean {
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
    StatusOptions.hasConflict,
    StatusOptions.missing
  ];

  static isErrorOption(status: Status): boolean {
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

  static isScheduledOption(status: Status): boolean {
    let isScheduledOption = false;
    StatusOptions.scheduledOptions.forEach(option => {
      if (option.title === status.title) {
        isScheduledOption = true;
      }
    });
    return isScheduledOption;
  }
}
