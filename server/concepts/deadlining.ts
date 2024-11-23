import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface DeadlineDoc extends BaseDoc{
    time: string, //TODO What type of object tracks time?
    item: ObjectId
}

export default class DeadliningConcept{
    public readonly deadlines: DocCollection<DeadlineDoc>;

    /**
     * Make an instance of Deadlining
     * @param collectionName The name of the deadline collection
     */
    public constructor(collectionName: string){
        this.deadlines = new DocCollection<DeadlineDoc>(collectionName);
    }

    /**
     * Create a new deadline
     * @param time The time associated with the deadline
     * @param item The item the deadline is for
     * @returns A success message and the DeadlineDoc created
     */
    async createDeadline(time: string, item: ObjectId){
        const _id = await this.deadlines.createOne({time, item});
        return {msg: `Successfully created new deadline`, deadline: await this.deadlines.readOne({_id})};
    }

    /**
     * Checks if a deadline has passed
     * @param deadline id of the deadline to check
     * @returns true if the deadline has passed. False otherwise
     * @throws NotFoundError if the deadline does not exist
     */
    async hasPassed(deadline: ObjectId){
        const result = this.deadlines.readOne({deadline});
        if (!result){
            throw new NotFoundError(`Deadline ${deadline} does not exist`)
        }
        return //TODO deadline.time<now
    }

    /**
     * 
     * @param deadline ObjectId of the deadine to checl 
     * @returns How much time is left until the deadline
     * @throws NotFoundError if the deadline does not exist
     */
    async getTimeLeft(deadline: ObjectId){
        const result = this.deadlines.readOne({deadline});
        if (!result){
            throw new NotFoundError(`Deadline ${deadline} does not exist`)
        }
        return //TODO deadline.time-now
    }
    
    /**
     * Updates the time on a deadline
     * @param deadline ObjectId of the deadline to update
     * @param newTime Updated time for the deadline
     * @returns Success message
     * @Throws NotFoundError if the deadline does not exist
     * @Throws NotAllowedError if the newTime has already passed
     */
    async updateDeadline(deadline: ObjectId, newTime: string){
        await this.deadlines.partialUpdateOne({deadline}{time: newTime}); //Do some sort of check to see that the time is valid and deadline exists 
        return{msg: `Succesfully updated deadline`}
    }
}