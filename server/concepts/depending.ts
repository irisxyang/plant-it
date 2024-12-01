import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface DependencyDoc extends BaseDoc {
  dependent: ObjectId;
  independent: ObjectId;
}

export default class DependingConcept {
  public readonly dependencies: DocCollection<DependencyDoc>;

  /**
   * Create a new instance of depending
   * @param collectionName The name of the depending collection
   */
  constructor(collectionName: string) {
    this.dependencies = new DocCollection<DependencyDoc>(collectionName);
  }

  /**
   * Create a new dependency between two objects
   * @param independent The independent object
   * @param dependent The dependent object
   * @returns A success message and the objectId of the dependency
   * @throws NotAllowedError if dependency already exists
   */
  async createDependency(independent: ObjectId, dependent: ObjectId) {
    if (await this.checkForDependency(independent, dependent)) {
      throw new NotAllowedError(`A dependency already exists with independent: ${independent} and dependent: ${dependent}`);
    }
    const _id = this.dependencies.createOne({ independent, dependent });
    return { msg: `Succesfully created new dependency!`, dependency: _id };
  }

  /**
   * Check if a dependency exists
   * @param independent The independent object
   * @param dependent The dependent object
   * @returns True if the dependency already exists, false otherwise
   */
  async checkForDependency(independent: ObjectId, dependent: ObjectId) {
    const result = await this.dependencies.readOne({ independent, dependent });
    return result !== null ? true : false;
  }

  /**
   * Remove a dependency
   * @param independent The independent object
   * @param dependent The dependent object
   * @throws NotAllowedError if dependency did not already exist
   */
  async removeDependency(independent: ObjectId, dependent: ObjectId) {
    const result = await this.dependencies.deleteOne({ independent, dependent });
    if (!result.deletedCount) {
      throw new NotAllowedError(`Removal failed, ${dependent} does not have dependency on ${independent}`);
    }
  }

  /**
   * Gets all the objects that are dependent on certain object
   * @param independent The object to check for
   * @returns A list of objects that are dependent
   */
  async getDependents(independent: ObjectId) {
    return await this.dependencies.readMany({ independent: independent });
  }

  /**
   * Get all of the objects a certain object is dependent on
   * @param dependent The object to check
   * @returns A list of all objects the specified object is dependent on
   */
  async getDependencies(dependent: ObjectId) {
    return await this.dependencies.readMany({ dependent: dependent });
  }
}
