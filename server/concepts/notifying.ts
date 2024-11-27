import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface NotifDoc extends BaseDoc {
  notifee: ObjectId;
  message: string;
  resource: ObjectId | null;
}

export default class NotifyingConcept {
  public readonly notifs: DocCollection<NotifDoc>;

  /**
   * Make an instance of Notifying
   * @param collectionName The name of the notifying collection
   */
  constructor(collectionName: string) {
    this.notifs = new DocCollection<NotifDoc>(collectionName);
  }

  /**
   * Create a new notification
   * @param notifee ObjectId of the user the notification is adressed to
   * @param message Message of the notification
   * @param resource Resource associated to the notification
   * @returns A success message and the created NotifDoc
   */
  async createNotif(notifee: ObjectId, message: string, resource: ObjectId | null = null) {
    const _id = await this.notifs.createOne({ notifee, message, resource });
    return { msg: "Notif created successfully", notification: await this.notifs.readOne({ _id }) };
  }

  /**
   * Delete a notification
   * @param notif ObjectId of the notification to be deleted
   * @returns success message
   * @throws NotFoundError if notification is not found in the database
   */
  async delNotif(notif: ObjectId) {
    const result = await this.notifs.deleteOne({ notif });
    if (!result.deletedCount) {
      throw new NotFoundError(`Notification ${notif} not found for deletion`);
    }
    return { msg: "Notification successfully deleted" };
  }

  /**
   * Get all the notifications assigned to a certain user
   * @param notifee The user to search notifications by
   * @returns An array of notifications targeted at said user, or an empty array if none are found
   */
  async getNotifsByUser(notifee: ObjectId) {
    const results = await this.notifs.readMany({ notifee: notifee });
    // if (!results) {
    //   throw new NotFoundError(`User ${notifee} does not have any notifications`); //RESOLVED This feels like it shouldn't be an error. Maybe just silently return an empty list instead?
    // }
    return results;
  }

  /**
   * Get all the notifications associated with a given resource
   * @param resource Resource to search notifications by
   * @returns An array of notifications associated to a given resource, or an empty array if none are found
   */
  async getNotifsByResource(resource: ObjectId) {
    const results = await this.notifs.readMany({ resource: resource });
    // if (!results) {
    //   throw new NotFoundError(`There are no notifications associated with resource: ${resource}`); //RESOLVED This feels like it shouldn't be an error. Maybe just silently return an empty list instead?
    // }
    return results;
  }

  /**
   * Deletes all notifications assigned to a certain user
   * @param notifee The user to delete all notifications for
   * @returns Message stating success or failure to find any notifications
   */
  async delNotifsByUser(notifee: ObjectId) {
    const result = await this.notifs.deleteMany({ notifee: notifee });
    if (!result.deletedCount) {
      return { msg: `Did not find any notifications associated with user: ${notifee}` };
    }
    return { msg: `Successfully deleted notifications assigned to user: ${notifee}` };
  }

  /**
   * Deletes all notifications assigned to a certain user
   * @param notifee The user to delete all notifications for
   * @returns Message stating success or failure to find any notifications
   */
  async delNotifsByResource(resource: ObjectId) {
    const result = await this.notifs.deleteMany({ resource: resource });
    if (!result.deletedCount) {
      return { msg: `Did not find any notifications associated with resource: ${resource}` };
    }
    return { msg: `Successfully deleted notifications associated with resource: ${resource}` };
  }
}
