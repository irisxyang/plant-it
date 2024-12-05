import { Deadlining, Project } from "./app";
import { TaskDoc } from "./concepts/tasking";

/**
 * This class does useful conversions for the frontend.
 */
export default class Responses {
  /**
   * Convert TaskDocs into a more readable format by including the deadline and project name.
   */
  static async tasks(task: TaskDoc[]) {
    const projects = await Promise.all(task.map((t) => Project.getProjectById(t.project)));
    const deadlines = await Promise.all(task.map((t) => Deadlining.getItemDeadline(t._id)));
    const deadlineStrings = deadlines.map((d) => (d ? d.toLocaleString("default", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }) : null));
    return task.map((t, i) => ({ ...t, projectName: projects[i].name, deadline: deadlineStrings[i] }));
  }
}

// Example of how to register a custom error handler
// Router.registerError(PostAuthorNotMatchError, async (e) => {
//   const username = (await Authing.getUserById(e.author)).username;
//   return e.formatWith(username, e._id);
// });
