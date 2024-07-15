
/**
 * Just stores the staff member's name.
 */
export class SchedulerName {
    /**
     * The name of staff member currently using the app.
     */
    public static get name(): string {
        return this._name;
    }
    private static _name = "Scheduler";

    /**
     * Ask the user for their name
     */
    public static getName() {
        this._name = window.prompt("Your Name:", "") ?? "Scheduler";
    }
}