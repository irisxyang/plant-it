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
  async createDeadline(time: Date, item: ObjectId) {
    if (Date.now() < time.getTime()) {
      throw new NotAllowedError(`Can't set a deadline in the past!`);
    }
    const _id = await this.deadlines.createOne({ time, item });
    return { msg: `Successfully created new deadline`, deadline: await this.deadlines.readOne({ _id }) };
  }

  /**
   * Checks if a deadline has passed
   * @param deadline id of the deadline to check
   * @returns true if the deadline has passed. False otherwise
   * @throws NotFoundError if the deadline does not exist
   */
  async hasPassed(deadline: ObjectId) {
    const result = await this.deadlines.readOne({ deadline });
    if (!result) {
      throw new NotFoundError(`Deadline ${deadline} does not exist`);
    }
    return result.time.getTime() < Date.now();
  }

  /**
   *
   * @param deadline ObjectId of the deadine to checl
   * @returns How much time is left until the deadline in millseconds
   * @throws NotFoundError if the deadline does not exist
   */
  async getTimeLeft(deadline: ObjectId) {
    const result = await this.deadlines.readOne({ deadline });
    if (!result) {
      throw new NotFoundError(`Deadline ${deadline} does not exist`);
    }
    return Date.now() - result.time.getTime();
  }

  /**
   * Updates the time on a deadline
   * @param deadline ObjectId of the deadline to update
   * @param newTime Updated time for the deadline
   * @returns Success message
   * @Throws NotFoundError if the deadline does not exist
   * @Throws NotAllowedError if the newTime has already passed
   */
  async updateDeadline(deadline: ObjectId, newTime: Date) {
    if (Date.now() < newTime.getTime()) {
      throw new NotAllowedError(`Can't set a deadline in the past!`);
    }
    const result = await this.deadlines.partialUpdateOne({ _id: deadline }, { time: newTime });
    if (!result.matchedCount) {
      throw new NotFoundError(`Deadline: ${deadline} did not match any deadlines in the database`);
    }
    return { msg: `Succesfully updated deadline` };
  }
}
