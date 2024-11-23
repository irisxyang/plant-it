import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";



export interface NotifDoc extends BaseDoc {
    notifee: ObjectId,
    message: String,
    resource: ObjectId
}

export default class NotifyingConcept{
    public readonly notifs: DocCollection<NotifDoc>;

    /**
     * Make an instance of Notifying
     * @param collectionName The name of the notifying collection
     */
    constructor(collectionName: string){
        this.notifs = new DocCollection<NotifDoc>(collectionName);
    }
    
    /**
     * Create a new notification
     * @param notifee ObjectId of the user the notification is adressed to
     * @param message Message of the notification
     * @param resource Resource associated to the notification
     * @returns A success message and the created NotifDoc
     */
    async createNotif(notifee: ObjectId, message: String, resource: ObjectId = undefined) {//TODO default params check
        const _id = await this.notifs.createOne({notifee, message, resource});
        return {msg: "Notif created successfully", notification: await this.notifs.readOne({_id})};
    }

    /**
     * Delete a notification
     * @param notif ObjectId of the notification to be deleted
     * @returns success message
     */
    async delNotif(notif: ObjectId){ //TODO should we be checking for existence of the notification before deletion?
        await this.notifs.deleteOne({notif});
        return {msg: "Notification successfully deleted"};
    }
    
    /**
     * Get all the notifications assigned to a certain user
     * @param notifee The user to search notifications by 
     * @returns An array of notifications targeted at said user
     * @throws NotFoundError if user has no notifications
     */
    async getNotifsByUser(notifee: ObjectId){
        const results = await this.notifs.readMany({notifee: notifee});
        if (!results){
            throw new NotFoundError(`User ${notifee} does not have any notifications`)//TODO This feels like it shouldn't be an error. Maybe just silently return an empty list instead?
        }
        return results
    }

    /**
     * Get all the notifications associated with a given resource
     * @param resource Resource to search notifications by
     * @returns An array of notifications associated to a given resource
     * @throws NotFoundError if resource is not associated with any notifications
     */
    async getNotifsByResource(resource: ObjectId){
        const results = await this.notifs.readMany({resource: resource});
        if (!results){
            throw new NotFoundError(`There are no notifications associated with resource: ${resource}`)//TODO This feels like it shouldn't be an error. Maybe just silently return an empty list instead?
        }
        return results
    }

    /**
     * Deletes all notifications assigned to a certain user
     * @param notifee The user to delete all notifications for
     * @returns Success message
     */
    async delNotifsByUser(notifee: ObjectId){
        await this.notifs.deleteMany({notifee: notifee});
        return {msg: `Successfully deleted notifications assigned to user: ${notifee}`}
    }

    /**
     * Deletes all notifications assigned to a certain user
     * @param notifee The user to delete all notifications for
     * @returns Success message
     */
    async delNotifsByResource(resource: ObjectId){
        await this.notifs.deleteMany({resource: resource});
        return {msg: `Successfully deleted notifications associated with resource: ${resource}`}
    }
    

}