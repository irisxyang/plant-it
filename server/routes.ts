import { ObjectId } from "mongodb";
import Responses from "./responses";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Deadlining, Depending, Notifying, Project, ProjectMember, Sessioning, Task } from "./app";
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
  async deleteMemberFromProject(session: SessionDoc, id: string, member: string) {
    const user = Sessioning.getUser(session);
    const projectId = new ObjectId(id);
    const memberToDelete = new ObjectId(member);

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
   * create task
   * only project manager can create tasks for that project
   * TODO: consider if we should limit task title length (ex: 100 characters)
   * TODO: decide if tasks must be assigned deadlines? currently required.
   * assignee is required arg, set to '' if unassigned
   */
  @Router.post("/project/tasks")
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
   * delete task
   * only project manager can delete tasks for that project
   */
  @Router.delete("/project/tasks/:id")
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
   * @returns The deadline date for the task
   */
  @Router.get("/project/task/:id/deadline")
  async getTaskDeadline(id: string) {
    const taskId = new ObjectId(id);
    const deadline = await Deadlining.getItemDeadline(taskId);
    return deadline;
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
    console.log("mhm" + project);
    const user = Sessioning.getUser(session);
    console.log("2");
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

  // TODO: add fn to set task to COMPLETE
  // sync this with reward! if it is complete, then create new reward
  /**
   * Marks a task as completed
   * @param session The session of the user
   * @param id The id of the task to complete
   */
  @Router.post("/project/task/:id/complete")
  async markTaskAsComplete(session: SessionDoc, id: string) {}

  // TODO: add fn to set task to INCOMPLETE
  // should we consider taking away rewards if a task is reset to incomplete?
  // the rewarding concept should be made in a way that it does not allow you to assign
  // multiple rewards for the same task (so if you check then uncheck then check a task,
  // it won't just keep rewarding you new rewards, it will just have you keep the first reward)
  /**
   * Marks a task as incomplete
   * @param session The session of the user
   * @param id The id of the task to mark as incomplete
   */
  @Router.post("/project/task/:id/incomplete")
  async markTaskAsIncomplete(session: SessionDoc, id: string) {}

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

  // @Router.get("/posts")
  // @Router.validate(z.object({ author: z.string().optional() }))
  // async getPosts(author?: string) {
  //   let posts;
  //   if (author) {
  //     const id = (await Authing.getUserByUsername(author))._id;
  //     posts = await Posting.getByAuthor(id);
  //   } else {
  //     posts = await Posting.getPosts();
  //   }
  //   return Responses.posts(posts);
  // }

  // @Router.post("/posts")
  // async createPost(session: SessionDoc, content: string, options?: PostOptions) {
  //   const user = Sessioning.getUser(session);
  //   const created = await Posting.create(user, content, options);
  //   return { msg: created.msg, post: await Responses.post(created.post) };
  // }

  // @Router.patch("/posts/:id")
  // async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
  //   const user = Sessioning.getUser(session);
  //   const oid = new ObjectId(id);
  //   await Posting.assertAuthorIsUser(oid, user);
  //   return await Posting.update(oid, content, options);
  // }

  // @Router.delete("/posts/:id")
  // async deletePost(session: SessionDoc, id: string) {
  //   const user = Sessioning.getUser(session);
  //   const oid = new ObjectId(id);
  //   await Posting.assertAuthorIsUser(oid, user);
  //   return Posting.delete(oid);
  // }

  // @Router.get("/friends")
  // async getFriends(session: SessionDoc) {
  //   const user = Sessioning.getUser(session);
  //   return await Authing.idsToUsernames(await Friending.getFriends(user));
  // }

  // @Router.delete("/friends/:friend")
  // async removeFriend(session: SessionDoc, friend: string) {
  //   const user = Sessioning.getUser(session);
  //   const friendOid = (await Authing.getUserByUsername(friend))._id;
  //   return await Friending.removeFriend(user, friendOid);
  // }

  // @Router.get("/friend/requests")
  // async getRequests(session: SessionDoc) {
  //   const user = Sessioning.getUser(session);
  //   return await Responses.friendRequests(await Friending.getRequests(user));
  // }

  // @Router.post("/friend/requests/:to")
  // async sendFriendRequest(session: SessionDoc, to: string) {
  //   const user = Sessioning.getUser(session);
  //   const toOid = (await Authing.getUserByUsername(to))._id;
  //   return await Friending.sendRequest(user, toOid);
  // }

  // @Router.delete("/friend/requests/:to")
  // async removeFriendRequest(session: SessionDoc, to: string) {
  //   const user = Sessioning.getUser(session);
  //   const toOid = (await Authing.getUserByUsername(to))._id;
  //   return await Friending.removeRequest(user, toOid);
  // }

  // @Router.put("/friend/accept/:from")
  // async acceptFriendRequest(session: SessionDoc, from: string) {
  //   const user = Sessioning.getUser(session);
  //   const fromOid = (await Authing.getUserByUsername(from))._id;
  //   return await Friending.acceptRequest(fromOid, user);
  // }

  // @Router.put("/friend/reject/:from")
  // async rejectFriendRequest(session: SessionDoc, from: string) {
  //   const user = Sessioning.getUser(session);
  //   const fromOid = (await Authing.getUserByUsername(from))._id;
  //   return await Friending.rejectRequest(fromOid, user);
  // }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
