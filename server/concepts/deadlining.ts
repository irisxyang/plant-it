import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface DeadlineDoc extends BaseDoc {
  time: Date;
  item: ObjectId;
}

export default class DeadliningConcept {
  public readonly deadlines: DocCollection<DeadlineDoc>;

  /**
   * Make an instance of Deadlining
   * @param collectionName The name of the deadline collection
   */
  public constructor(collectionName: string) {
    this.deadlines = new DocCollection<DeadlineDoc>(collectionName);
  }

  /**
   * Create a new deadline
   * @param time The time associated with the deadline
   * @param item The item the deadline is for
   * @returns A success message and the DeadlineDoc created
   * @throws NotAllowedError if time is in the past
   */
  async createDeadline(item: ObjectId, time: Date) {
    if (time.getTime() < Date.now()) {
      throw new NotAllowedError(`Can't set a deadline in the past!`);
    }
    const _id = await this.deadlines.createOne({ time, item });
    return { msg: `Successfully created new deadline`, deadline: await this.deadlines.readOne({ _id }) };
  }

  /**
   * Get the deadline for a given item or false if no deadline exists
   * @param item ObjectId of the item to look up
   * @returns The deadline for the item, or false if no deadline exists
   */
  async getItemDeadline(item: ObjectId) {
    const result = await this.deadlines.readOne({ item });
    return result?.time || false;
  }

  /**
   * Checks if a deadline has passed
   * @param item ObjectId of the item to check
   * @returns true if the deadline has passed. False otherwise
   * @throws NotFoundError if the deadline does not exist
   */
  async hasPassed(item: ObjectId) {
    const result = await this.deadlines.readOne({ item });
    if (!result) {
      throw new NotFoundError(`Deadline ${item} does not exist`);
    }
    return result.time.getTime() < Date.now();
  }

  /**
   *
   * @param item ObjectId of the item to check
   * @returns How much time is left until the deadline in millseconds
   * @throws NotFoundError if the deadline does not exist
   */
  async getTimeLeft(item: ObjectId) {
    const result = await this.deadlines.readOne({ item });
    if (!result) {
      throw new NotFoundError(`Deadline ${item} does not exist`);
    }
    return Date.now() - result.time.getTime();
  }

  /**
   * Updates the time on a deadline
   * @param item ObjectId of the item to update
   * @param newTime Updated time for the deadline
   * @returns Success message
   * @Throws NotFoundError if the deadline does not exist
   * @Throws NotAllowedError if the newTime has already passed
   */
  async updateDeadline(item: ObjectId, newTime: Date) {
    if (Date.now() > newTime.getTime()) {
      throw new NotAllowedError(`Can't set a deadline in the past!`);
    }

    await this.deadlines.partialUpdateOne({ item }, { time: newTime }, { upsert: true });
    return { msg: "Succesfully updated deadline" };
  }

  /**
   * Delete a deadline
   * @param item ObjectId of the item to delete
   * @returns Success message
   * @throws NotFoundError if the deadline does not exist
   */
  async deleteDeadline(item: ObjectId) {
    await this.deadlines.deleteOne({ item });
    return { msg: "Succesfully deleted deadline" };
  }
}
