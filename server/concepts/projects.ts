import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ProjectDoc extends BaseDoc {
  creator: ObjectId;
  name: string;
}

/**
 * concept: Project
 * stores metadata associated with a Project
 */
export default class ProjectConcept {
  public readonly projects: DocCollection<ProjectDoc>;

  constructor(collectionName: string) {
    this.projects = new DocCollection<ProjectDoc>(collectionName);
  }

  /**
   * Create a new project
   * @param creator ObjectId of creator of the project, also the admin
   * @param name Name of the project
   * @returns Object with message of success (msg) and the new project (project)
   */
  async create(creator: ObjectId, name: string) {
    await this.assertProjectNameUnique(creator, name);
    const _id = await this.projects.createOne({ creator, name });
    const project = await this.projects.readOne({ _id });
    if (!project) {
      throw new Error("Project creation failed!");
    }
    return { msg: "Project successfully created!", project };
  }

  /**
   * Gets a project given a project id
   * @param _id The id of the project to find
   * @returns The specified project
   * @throws NotFoundError if project does not exist
   */
  async getProjectById(_id: ObjectId) {
    const result = await this.projects.readOne({ _id });
    if (!result) {
      throw new NotFoundError(`Project with id ${_id} not found`);
    }
    return result;
  }

  /**
   * given list of project object ids, returns the projects
   * @param ids list of project object ids
   * @returns
   */
  async getProjectsByIds(ids: ObjectId[]) {
    const projects = await this.projects.readMany({ _id: { $in: ids } });
    return projects;
  }

  /**
   * Updates a projects name
   * @param _id Id of the project to update
   * @param newName The name to update to
   * @returns Success message
   */
  async updateProjectName(_id: ObjectId, newName: string) {
    const project = await this.projects.readOne({ _id });
    if (!project) {
      throw new NotAllowedError("Project does not exist!");
    }
    const creator = project.creator;
    await this.assertProjectNameUnique(creator, newName);
    await this.projects.partialUpdateOne({ _id }, { name: newName });

    return { msg: "Project name successfully updated!" };
  }

  /**
   * Update the project creator/admin
   * @param _id Id of the project to udpate
   * @param newCreator New creator to update to
   * @returns Success message
   * @throws NotFoundError if no project with _id is found
   */
  async updateProjectCreator(_id: ObjectId, newCreator: ObjectId) {
    const results = await this.projects.partialUpdateOne({ _id }, { creator: newCreator });
    if (!results.matchedCount) {
      throw new NotFoundError(`No project find with id ${_id}`);
    }
    return { msg: "Project manager successfully updated!" };
  }

  /**
   * Delete a project
   * @param _id Id of the project to delete
   * @returns Success message
   * @throws NotFoundError if no project with that id is found
   */
  async deleteProject(_id: ObjectId) {
    const result = await this.projects.deleteOne({ _id });
    if (!result.deletedCount) {
      throw new NotFoundError(`No project with id ${_id} found`);
    }
    return { msg: "Project successfully deleted!" };
  }

  /**
   * Asserts that a user is the creator of a certain project
   * @param _id Id of the project to check
   * @param user Id of the user to check
   * @throws NotFoundError if project does not exist
   * @throws UserCreatorNotMatchError if the user and creator do not match
   */
  async assertUserIsCreator(_id: ObjectId, user: ObjectId) {
    const project = await this.projects.readOne({ _id });
    if (!project) {
      throw new NotFoundError(`Project ${_id} does not exist!`);
    }
    if (project.creator.toString() !== user.toString()) {
      throw new UserCreatorNotMatchError(user, _id);
    }
  }

  /**
   * Asserts that a project name is unique. Requires all names to be unique regardless of owner
   * @param name Name of the project to check
   * @throws NotAllowedError if name is not unique
   */
  private async assertProjectNameUnique(creator: ObjectId, name: string) {
    if (await this.projects.readOne({ creator, name })) {
      throw new NotAllowedError(`Project by ${creator} with name ${name} already exists! Please choose a different name.`);
    }
  }
}

export class UserCreatorNotMatchError extends NotAllowedError {
  constructor(
    public readonly creator: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the creator of project {1}!", creator, _id);
  }
}
