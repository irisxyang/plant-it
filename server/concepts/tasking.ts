import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface TaskDoc extends BaseDoc {
  title: string;
  notes: string;
  project: ObjectId;
  assignee: ObjectId;
  completion: boolean;
  links: string[];
}

export default class TaskingConcept {
  public readonly tasks: DocCollection<TaskDoc>;

  constructor(collectionName: string) {
    this.tasks = new DocCollection<TaskDoc>(collectionName);
  }

  /**
   * Create a new task
   * @param title Title of the task
   * @param notes Notes about the task
   * @param project ObjectId of the project that the task belongs to
   * @param assignee ObjectId of the user the task is assigned to. Defaults to undefined for unassigned tasks
   * @returns Object with a success message (msg) and the task created (task)
   */
  //TODO Decide between a default arg for asignee or making it optional and expecting syncs to input null value
  async createTask(title: string, notes: string, project: ObjectId, links: string[], assignee: ObjectId = undefined) {
    const _id = await this.tasks.createOne({ title, notes, project, assignee, completion: false, links });
    return { msg: "Task successfully created!", task: await this.tasks.readOne({ _id }) };
  }

  /**
   * Delete a task
   * @param _id _id of the task to delete
   * @returns Success message
   */
  async deleteTask(_id: ObjectId) {
    await this.tasks.deleteOne({ _id });
    return { msg: "Task deleted successfully!" };
  }

  /**
   * Delete all the tasks assigned for a certain project
   * @param project ObjectId of the project to delete all tasks for
   * @returns Success message
   */
  async deleteTasksForProject(project: ObjectId) {
    await this.tasks.deleteMany({ project: project });
    return { msg: "Tasks for project successfully deleted." };
  }

  /**
   * Update the description of a task
   * @param _id The _id of the task to update the description of
   * @param description New description for the task
   * @returns Success message
   */
  async updateNotes(_id: ObjectId, notes: string) {
    await this.tasks.partialUpdateOne({ _id }, { notes: notes });
    return { msg: "Task description successfully updated!" };
  }

  /**
   * Update the assignee for a task
   * @param _id _id of the task to update
   * @param assignee new assignee for task. Leave out to leave task unassigned
   * @returns
   */
  async updateAssignee(_id: ObjectId, assignee: ObjectId = undefined) {
    //TODO is that how TS default params work?
    await this.tasks.partialUpdateOne({ _id }, { assignee: assignee });
    return { msg: "Task assignee successfully updated!" };
  }

  /**
   * Get a full task object
   * @param _id _id of the task to get
   * @returns TaskDoc of the correlated task
   */
  async getTaskById(_id: ObjectId) {
    return await this.tasks.readOne({ _id });
  }

  /**
   * Get all of the tasks assigned to a certain user
   * @param assignee Asignee to search tasks by
   * @returns An array of TaskDocs assigned to the assignee
   * @throws NotFoundError if user is not assigned any tasks
   */
  async getTasksByAssignee(assignee: ObjectId) {
    const userTasks = await this.tasks.readMany({ assignee: assignee });
    if (!userTasks) {
      throw new NotFoundError(`User ${assignee} does not have any tasks!`); //TODO: Should this actually be an error or expected behavior?
    }
    return userTasks;
  }

  //   // TODO: how to set a doc field to be undefined?.ben: I think this can be taken care of in same function as reassignment
  //   async unassignTask(_id: ObjectId) {
  //     const assignee = undefined;
  //     await this.tasks.partialUpdateOne({ _id }, { assignee });
  //     return { msg: "TODO: partial update to null or undefined?" };
  //   }

  /**
   * Updates the completion status of a task
   * @param _id _id of the task to update
   * @param completion new status of task
   * @returns Message stating what change was made
   */
  async updateCompletionStatus(_id: ObjectId, completion: boolean) {
    //TODO should we have checking to see if the task even exists?
    await this.tasks.partialUpdateOne({ _id }, { completion });
    if (completion) {
      return { msg: "Task marked as completed!" };
    }
    return { msg: "Task marked incomplete." };
  }

  /**
   * Gets a list of all tasks that are part of a certain project
   * @param project ObjectId of the project to search for
   * @returns An Array of all the tasks belonging to a given project
   *
   */
  async getTasksByProject(project: ObjectId) {
    return await this.tasks.readMany({ project });
  }
  /**
   *
   * @param task task id for which you want to get assignee for
   * @returns assignee of that task
   */
  async getAssignee(task: ObjectId) {
    const fetchedTask = await this.tasks.readOne({ task });
    if (!fetchedTask) {
      throw new NotAllowedError("Task does not exist!");
    }
    return fetchedTask.assignee;
  }
}
