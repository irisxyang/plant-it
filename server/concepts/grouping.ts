import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface GroupItemDoc extends BaseDoc {
  group: ObjectId; // shouldn't use label if we consider labels can be non-unique across users
  item: ObjectId;
}

/**
 * concept: Grouping
 */
export default class GroupItemConcept {
  public readonly groupitems: DocCollection<GroupItemDoc>;

  constructor(collectionName: string) {
    this.groupitems = new DocCollection<GroupItemDoc>(collectionName);
  }

  //TODO. Under this current design, if a group is created with only one item and that item is deleted, the entire group is deleted. Groups need to have at least one item to exist

  /**
   * Add an item to a group.
   *
   * @param group ObjectId of group that you want to add item to
   * @param item ObjectId of the item to add to the group
   * @returns Success message
   */
  async addGroupItem(group: ObjectId, item: ObjectId) {
    await this.groupitems.createOne({ group, item });
    return { msg: "Added item to group!" };
  }

  /**
   * Remove an item from a group
   *
   * @param group ObjectId of group that you want to remove item from
   * @param item ObjectId of the item you're adding to the group
   * @returns Success Message
   *
   * TODO Throw an error if item or group is not found
   */
  async removeGroupItem(group: ObjectId, item: ObjectId) {
    await this.groupitems.deleteOne({ group, item });
    return { msg: "Removed item from group!" };
  }

  /**
   * Get a list of all the items (in form of objectId) in a given group
   * @param label Label of the group you're getting items from
   * @param author: ObjectId of the author of the group you're getting items from
   * @returns A list of the ObjectIds of the items contained in the specified group.
   * @throws NotFoundError If the group does not exist
   */
  // get all items in a group
  async getItemsInGroup(group: ObjectId) {
    const itemDocs = await this.groupitems.readMany({ group }, { projection: { item: 1 } });
    return itemDocs.map((item) => item.item);
  }

  /**
   *
   * @param item ObjectId of the item you want to search groups for
   * @returns A list of groupIds
   * @throws NotFoundError if item is not contained in any groups
   */
  async getGroupsForItem(item: ObjectId) {
    const itemDocs = await this.groupitems.readMany({ item: item });
    if (itemDocs.length === 0) {
      throw new NotFoundError(`item ${item} is not in any groups`);
    }
    return itemDocs.map((item) => item.group);
  }

  /**
   *
   * @param group ObjectId of the group you're deleting
   * @returns Success message
   */
  async deleteAllItemsInGroup(group: ObjectId) {
    await this.groupitems.deleteMany({ group });
    return { msg: "Deleted all instances of group!" };
  }

  /**
   * Deletes an item from every group it is contained in
   * @param item ObjectId of the item to remove from all groups
   * use when deleting a member from all groups
   * @returns Success message
   */
  async deleteItemFromAllGroups(item: ObjectId) {
    await this.groupitems.deleteMany({ item });
    return { msg: "Deleted all instances of item!" };
  }

  /**
   *
   * @param group ObjectId of the group you're checking to see if the item is in
   * @param item: The item you're checking if is in group
   * @throws NotFoundError is item is not in the group
   */
  async assertItemInGroup(group: ObjectId, item: ObjectId) {
    const pair = await this.groupitems.readOne({ group, item });
    if (!pair) {
      throw new NotFoundError(`Item ${item} not in group ${group}!`);
    }
  }
  /**
   *
   * @param group ObjectId of the group you're checking to see if the item is in
   * @param item: The item you're checking if is in group
   * @throws NotFoundError is item is not in the group
   */
  async assertItemNotInGroup(group: ObjectId, item: ObjectId) {
    const pair = await this.groupitems.readOne({ group, item });
    if (pair) {
      throw new NotFoundError(`Item ${item} is already in group ${group}!`);
    }
  }
}
