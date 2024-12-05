import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface TaskDoc extends BaseDoc {
  title: string;
  notes: string;
  project: ObjectId;
  assignee: string; // username, "" if not assigned
  completion: boolean;
  links: string[];
}

export default class TaskingConcept {
  public readonly tasks: DocCollection<TaskDoc>;

  constructor(collectionName: string) {
    this.tasks = new DocCollection<TaskDoc>(collectionName);
  }

  /**
   * Create a new task that has not been completed
   * @param title Title of the task
   * @param notes Notes about the task
   * @param project ObjectId of the project that the task belongs to
   * @param assignee Optional Param, ObjectId of the user the task is assigned to. Defaults to null for unassigned tasks
   * @returns Object with a success message (msg) and the task created (task)
   */
  async createTask(title: string, notes: string, project: ObjectId, links: string[], assignee: string) {
    const _id = await this.tasks.createOne({ title, notes, project, assignee, completion: false, links });
    const task = await this.tasks.readOne({ _id });
    if (!task) {
      throw new NotFoundError(`Task ${_id} could not be found after creation!`);
    }
    return { msg: "Task successfully created!", task };
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
    await this.tasks.deleteMany({ project });
    return { msg: "Tasks for project successfully deleted." };
  }

  /**
   * Update the description of a task
   * @param _id The _id of the task to update the description of
   * @param description New description for the task
   * @returns Success message
   */
  async updateNotes(_id: ObjectId, notes: string) {
    await this.tasks.partialUpdateOne({ _id }, { notes });
    return { msg: "Task description successfully updated!" };
  }

  /**
   * Update the assignee for a task
   * @param _id _id of the task to update
   * @param assignee Optional param. New assignee for task. Defaults to null for unassigned tasks
   * @returns Success message
   *
   */
  async updateAssignee(_id: ObjectId, assignee: string) {
    await this.tasks.partialUpdateOne({ _id }, { assignee });
    return { msg: `Task assignee successfully updated to ${assignee}!` };
  }

  /**
   * Get a full task object
   * @param _id _id of the task to get
   * @returns TaskDoc of the correlated task
   * @throws NotFoundError if no task is found
   */
  async getTaskById(_id: ObjectId) {
    const task = await this.tasks.readOne({ _id });
    if (!task) {
      throw new NotFoundError(`Task ${_id} not found!`);
    }
    return task;
  }

  /**
   * Get all of the tasks assigned to a certain user
   * @param assignee ObjectId of asignee to search tasks by. Use null to search for unassigned tasks
   * @returns An array of TaskDocs assigned to the assignee, empty if none
   */
  async getTasksByAssignee(assignee: string) {
    const userTasks = await this.tasks.readMany({ assignee });
    // if (!userTasks) {
    //   throw new NotFoundError(`User ${assignee} does not have any tasks!`); //RESOLVED: Should this actually be an error or expected behavior?
    // }
    return userTasks;
  }

  /**
   * Updates the completion status of a task
   * @param _id _id of the task to update
   * @param completion new status of task
   * @returns Message stating what change was made
   * @throws NotFoundError If
   */
  async updateCompletionStatus(_id: ObjectId, completion: boolean) {
    const result = await this.tasks.partialUpdateOne({ _id }, { completion });
    if (!result.matchedCount) {
      throw new NotFoundError(`Task: ${_id} not found to update completion status`);
    }
    return { msg: `Task marked ${completion ? "completed" : "incomplete"}.` };
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
}
