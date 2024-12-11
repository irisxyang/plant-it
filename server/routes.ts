import { ObjectId } from "mongodb";
import Responses from "./responses";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Deadlining, Depending, Notifying, Project, ProjectMember, Rewarding, Sessioning, Task } from "./app";
import { SessionDoc } from "./concepts/sessioning";

import { z } from "zod";
import { NotAllowedError } from "./concepts/errors";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  /**
   * create project
   * creator will be current session user with given name
   * name must be unique
   */
  @Router.post("/projects")
  async createProject(session: SessionDoc, name: string) {
    const user = Sessioning.getUser(session);
    // get the project
    const projectCreation = await Project.create(user, name);
    const project = projectCreation.project;
    // add creator as a member for that project
    await ProjectMember.addGroupItem(project._id, user);
    return { msg: projectCreation.msg, project };
  }

  /**
   * delete project
   * only the creator of the project can delete the project
   */
  @Router.delete("/projects/:id")
  async deleteProject(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(id);
    // only the creator should be able to delete the project
    await Project.assertUserIsCreator(projectId, user);
    await ProjectMember.deleteAllItemsInGroup(projectId);

    // delete all tasks associated with the project
    await Task.deleteTasksForProject(projectId);
    return await Project.deleteProject(projectId);
  }

  /**
   * get project given either a name or ID
   * TODO: get project by name... not necessary if names not unique across users?
   */
  @Router.get("/projects")
  async getProject(session: SessionDoc, name?: string, id?: string) {
    const user = Sessioning.getUser(session);
    let project;
    let projectId;
    if (id) {
      projectId = new ObjectId(id);
      await ProjectMember.assertItemInGroup(projectId, user);
      project = await Project.getProjectById(projectId);
    } else if (name) {
      project = await Project.getProjectByName(name, user);
    } else {
      throw new NotAllowedError("Did not specify project to fetch!");
    }
    return project;
  }

  /**
   * get projects that a user is a part of
   */
  @Router.get("/user/projects")
  async getUserProjects(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const projectIds = await ProjectMember.getGroupsForItem(user);

    return await Project.getProjectsByIds(projectIds);
  }

  /**
   * update project name
   * only creator of project can change project
   */
  @Router.patch("/project/name")
  async updateProjectName(session: SessionDoc, id: string, name: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(id);
    // only the creator should be able to update project anme
    await Project.assertUserIsCreator(projectId, user);

    return await Project.updateProjectName(projectId, name);
  }

  /**
   * update project manager
   * only creator of project can change project
   * only other members of the project can be assigned as the new manager
   */
  @Router.patch("/project/manager")
  async updateProjectManager(session: SessionDoc, id: string, manager: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(id);
    // only the creator should be able to update project anme
    await Project.assertUserIsCreator(projectId, user);

    const managerId = new ObjectId(manager);
    // new manager must already be a member of the project
    await ProjectMember.assertItemInGroup(projectId, managerId);
    return await Project.updateProjectCreator(projectId, managerId);
  }

  /**
   * add a new member to a project
   * only creator of project can add a member to the project
   */
  @Router.post("/project/members")
  async addMemberToProject(session: SessionDoc, id: string, member: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(id);
    const newMember = new ObjectId(member);

    await Project.assertUserIsCreator(projectId, user);
    await ProjectMember.assertItemNotInGroup(projectId, newMember);
    return await ProjectMember.addGroupItem(projectId, newMember);
  }

  /**
   * delete a member from a project
   * only creator of project can delete a member from the project
   */
  @Router.delete("/project/members")
  async deleteMemberFromProject(session: SessionDoc, id: string, memberuser: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(id);

    const member = await Authing.getUserByUsername(memberuser);
    const memberId = member._id;

    const memberToDelete = new ObjectId(memberId);

    await Project.assertUserIsCreator(projectId, user);

    return await ProjectMember.removeGroupItem(projectId, memberToDelete);
  }

  /**
   * get all members in a project
   */
  @Router.get("/project/members")
  async getAllMembersInProject(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(id);

    await ProjectMember.assertItemInGroup(projectId, user);
    const memberIds = await ProjectMember.getItemsInGroup(projectId);
    return await Authing.idsToUsernames(memberIds);
  }

  /**
   * Get a task by its ObjectId
   * @param id ObjectId of the task to get
   * @returns The TaskDoc of the task
   */
  @Router.get("/tasks/:id")
  async getTask(id: string) {
    const taskId = new ObjectId(id);
    return await Task.getTaskById(taskId);
  }

  /**
   * create task
   * only project manager can create tasks for that project
   * TODO: consider if we should limit task title length (ex: 100 characters)
   * TODO: decide if tasks must be assigned deadlines? currently required.
   * assignee is required arg, set to '' if unassigned
   */
  @Router.post("/tasks")
  async createTask(session: SessionDoc, title: string, notes: string, project: string, links: string[], assignee: string, deadline: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(project);

    await Project.assertUserIsCreator(projectId, user);

    // if assignee field not null, then check that user is actually member of project
    if (assignee) {
      const assigneeObj = await Authing.getUserByUsername(assignee);
      const assigneeId = assigneeObj._id;
      // assert that the user assigned is actually a member of the project
      await ProjectMember.assertItemInGroup(projectId, assigneeId);
    }

    const taskCreation = await Task.createTask(title, notes, projectId, links, assignee);
    const deadlineCreation = await Deadlining.createDeadline(taskCreation.task._id, new Date(deadline));
    return {
      msg: `${taskCreation.msg} ${deadlineCreation.msg}`,
      task: taskCreation.task,
      deadline: deadlineCreation.deadline,
    };
  }

  /**
   * update task notes
   * any member of project can update project's task notes
   */
  @Router.patch("/tasks/:id")
  async updateTask(session: SessionDoc, id: string, title: string, notes: string, assignee: string, deadline: string) {
    const user = Sessioning.getUser(session);
    const taskId = new ObjectId(id);

    const projectId = (await Task.getTaskById(taskId))?.project;
    if (!projectId) {
      throw new NotAllowedError("Task does not exist!");
    }
    await ProjectMember.assertItemInGroup(projectId, user);

    // set user as new assignee
    await Task.updateAssignee(taskId, assignee);

    await Task.updateTitle(taskId, title);
    await Task.updateNotes(taskId, notes);
    return { msg: `Successfully updated task!` };
  }

  /**
   * delete task
   * only project manager can delete tasks for that project
   */
  @Router.delete("/tasks/:id")
  async deleteTask(session: SessionDoc, task: string) {
    const user = Sessioning.getUser(session);
    const taskId = new ObjectId(task);

    const projectId = (await Task.getTaskById(taskId))?.project;
    if (!projectId) {
      throw new NotAllowedError("Task does not exist!");
    }
    await Project.assertUserIsCreator(projectId, user);

    await Task.deleteTask(taskId);
  }

  /**
   * Get the deadline for a task
   * @param id ObjectId of the task to get the deadline for
   * @returns The deadline date for the task, or false if no deadline exists
   */
  @Router.get("/project/task/:id/deadline")
  async getTaskDeadline(id: string) {
    const taskId = new ObjectId(id);
    return await Deadlining.getItemDeadline(taskId);
  }

  /**
   * Update the deadline for a task
   * @param id ObjectId of the task to update the deadline for
   * @param date New deadline for the task, parseable by Date
   * @returns Success message
   */
  @Router.patch("/project/task/:id/deadline")
  async updateTaskDeadline(id: string, date: string) {
    const taskId = new ObjectId(id);
    return await Deadlining.updateDeadline(taskId, new Date(date));
  }

  // TODO: add fn to get tasks with deadlines that are close?
  // TODO: add fn to get tasks whose deadlines are before / after some date?
  // just some ideas for functionality

  /**
   * get all tasks for a project from string of the projectId
   * only project members are able to see the tasks for a project
   */
  @Router.get("/project/tasks")
  async getTasksForProject(session: SessionDoc, project: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(project);

    await ProjectMember.assertItemInGroup(projectId, user);

    const tasks = await Task.getTasksByProject(projectId);
    return await Responses.tasks(tasks);
  }

  /**
   * get all tasks for a user
   * current user can only see their own tasks
   */
  @Router.get("/user/tasks")
  async getTasksForUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const userObject = await Authing.getUserById(user);
    const username = userObject.username;

    // should return all tasks associated with user
    const tasks = await Task.getTasksByAssignee(username);
    return await Responses.tasks(tasks);
  }

  /**
   * update task notes
   * any member of project can update project's task notes
   */
  @Router.patch("/project/task/description")
  async updateTaskDescription(session: SessionDoc, task: string, notes: string) {
    const user = Sessioning.getUser(session);
    const taskId = new ObjectId(task);

    const projectId = (await Task.getTaskById(taskId))?.project;
    if (!projectId) {
      throw new NotAllowedError("Task does not exist!");
    }
    await ProjectMember.assertItemInGroup(projectId, user);

    await Task.updateNotes(taskId, notes);
  }

  /**
   * update the user that the task is assigned to
   * only manager of the project for that task can do this
   * this should be called if a user is being added to a task
   *
   */
  @Router.post("/project/task/:id/assignees")
  async addTaskAssignee(session: SessionDoc, id: string, assignee: string) {
    console.log(assignee);
    const user = Sessioning.getUser(session);
    const taskId = new ObjectId(id);

    // get project id of the task to check if user is creator of project
    const projectId = (await Task.getTaskById(taskId))?.project;
    if (!projectId) {
      throw new NotAllowedError("Task does not exist!");
    }
    await Project.assertUserIsCreator(projectId, user);

    // set user as new assignee
    return await Task.updateAssignee(taskId, assignee);
  }

  /**
   * unassign task
   * only manager of the project for that task can do this
   */
  @Router.delete("/project/task/assignees")
  async unassignTask(session: SessionDoc, task: string) {
    const user = Sessioning.getUser(session);
    const taskId = new ObjectId(task);

    const projectId = (await Task.getTaskById(taskId))?.project;
    if (!projectId) {
      throw new NotAllowedError("Task does not exist!");
    }
    await Project.assertUserIsCreator(projectId, user);

    // assignee set to null in tasking class?
    return await Task.updateAssignee(taskId, "");
  }

  /**
   * Get rewards by user, project, or task.
   * @param session The session of the user
   * @param project The objectId of the project to check for
   * @param task The task to check for a reward
   * @returns A list of the rewards found
   */
  @Router.get("/rewards")
  async getRewards(session: SessionDoc, project?: string, task?: string) {
    const user = Sessioning.getUser(session);
    return await Rewarding.getRewards({
      user,
      project: project ? new ObjectId(project) : undefined,
      task: task ? new ObjectId(task) : undefined,
    });
  }

  /**
   * Gets all project rewards for all users of the project
   * @param project The objectId of the project to check for
   * @returns A list of the rewards found
   */
  @Router.get("/rewards/:project")
  async getProjectRewards(project: string) {
    // return { msg: "project rewards" };
    return await Rewarding.getRewards({
      project: new ObjectId(project),
    });
  }

  /**
   * Marks a task as completed
   * @param session The session of the user
   * @param id The id of the task to complete
   */
  @Router.post("/project/task/:id/complete")
  async markTaskAsComplete(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const username = (await Authing.getUserById(user)).username;
    const taskId = new ObjectId(id);
    const task = await Task.getTaskById(taskId);
    if (task.assignee !== username) {
      throw new NotAllowedError("You are not assigned to this task!");
    }
    const taskCompletion = await Task.updateCompletionStatus(taskId, true);
    const rewardCreation = await Rewarding.createReward(user, task.project, taskId);
    return { msg: `${taskCompletion.msg} ${rewardCreation.msg}`, reward: rewardCreation.reward };
  }

  /**
   * Marks a task as incomplete
   * @param session The session of the user
   * @param id The id of the task to mark as incomplete
   */
  @Router.post("/project/task/:id/incomplete")
  async markTaskAsIncomplete(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const username = (await Authing.getUserById(user)).username;
    const taskId = new ObjectId(id);
    const task = await Task.getTaskById(taskId);
    if (task.assignee !== username) {
      throw new NotAllowedError("You are not assigned to this task!");
    }
    const taskIncompletion = await Task.updateCompletionStatus(taskId, false);
    const taskReward = (await Rewarding.getRewards({ task: taskId }))[0];
    if (taskReward) {
      const rewardDeletion = await Rewarding.deleteReward(taskReward._id);
      return { msg: `${taskIncompletion.msg} ${rewardDeletion?.msg}` };
    }
    return taskIncompletion;
  }

  /**
   * Checks if a task can be started
   * @param id The id of the task to check
   * @returns true if the task can be started, false otherwise
   */
  @Router.get("/project/task/:id/start")
  async canStartTask(id: string) {
    const taskId = new ObjectId(id);
    return (await Depending.getDependents(taskId)).length === 0;
  }

  /**
   * Get all notifications for the current user
   * @param session The session of the user
   * @returns An array of Notification objects
   */
  @Router.get("/notifications")
  async getNotifications(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Notifying.getNotifsByUser(user);
  }

  /**
   * Create a notification for the user that is assigned to a task
   * @param id The id of the task to create a notification for
   * @param message The message to include in the notification
   */
  @Router.post("/project/task/:id/notify")
  @Router.validate(z.object({ message: z.string().min(1) }))
  async createTaskNotification(id: string, message: string) {
    const taskId = new ObjectId(id);
    const task = await Task.getTaskById(taskId);
    const notifeeId = (await Authing.getUserByUsername(task.assignee))._id;
    return await Notifying.createNotif(notifeeId, message, taskId);
  }

  /**
   * Create a notification for all team members of a project
   * @param id The id of the project to create a notification for
   * @param message The message to include in the notification
   */
  @Router.post("/project/:id/notifyTeam")
  @Router.validate(z.object({ message: z.string().min(1) }))
  async createTeamNotification(id: string, message: string) {
    const projectId = new ObjectId(id);
    const projectMemberIds = await ProjectMember.getItemsInGroup(projectId);
    return Promise.all(projectMemberIds.map((memberId) => Notifying.createNotif(memberId, message, projectId)));
  }

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users/username/:id")
  async getUsernameById(id: string) {
    const userId = new ObjectId(id);
    const userObject = await Authing.getUserById(userId);
    return userObject.username;
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
