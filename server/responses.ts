import { Deadlining, Project } from "./app";
import { TaskDoc } from "./concepts/tasking";

/**
 * This class does useful conversions for the frontend.
 */
export default class Responses {
  /**
   * Convert TaskDocs into a more readable format by including the deadline and project name.
   */
  static async tasks(tasks: TaskDoc[]) {
    const projects = await Promise.all(tasks.map((t) => Project.getProjectById(t.project)));
    const deadlines = await Promise.all(tasks.map((t) => Deadlining.getItemDeadline(t._id)));
    const deadlineStrings = deadlines.map((d) => (d ? d.toLocaleString("default", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }) : ""));
    const tasksWithProjectAndDeadline = tasks.map((t, i) => ({ ...t, projectName: projects[i].name, deadlineString: deadlineStrings[i], deadline: deadlines[i] }));
    return tasksWithProjectAndDeadline.sort((a, b) => {
      if (a.deadline === false && b.deadline === false) {
        return 0;
      }
      if (a.deadline === false) {
        return 1;
      }
      if (b.deadline === false) {
        return -1;
      }
      return a.deadline < b.deadline ? -1 : 1;
    });
  }
}

// Example of how to register a custom error handler
// Router.registerError(PostAuthorNotMatchError, async (e) => {
//   const username = (await Authing.getUserById(e.author)).username;
//   return e.formatWith(username, e._id);
// });
