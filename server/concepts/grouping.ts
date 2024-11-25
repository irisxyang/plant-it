import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface GroupItemDoc extends BaseDoc {
  label: String;
  author: ObjectId;
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
   * @param label Label of the group you're adding an item to
   * @param author: ObjectId of the author of the group you're adding to
   * @param item ObjectId of the item to add to the group
   * @returns Success message
   */
  async addGroupItem(label: String, author: ObjectId, item: ObjectId) {
    await this.groupitems.createOne({ label, author, item });
    return { msg: "Added item to group!" };
  }


  /**
   * Remove an item from a group
   * 
   * @param label Label of the group you're removing an item from
   * @param author: ObjectId of the author of the group you're removing from
   * @param item ObjectId of the item you're adding to the group
   * @returns Success Message
   * 
   * TODO Throw an error if item or group is not found
   */
  async removeGroupItem(label: String, author: ObjectId, item: ObjectId) {
    await this.groupitems.deleteOne({ label, author, item });
    return { msg: "Removed item from group!" };
  }

  /**
   * Get a list of all the items (in form of objectId) in a given group
   * @param label Label of the group you're getting items from
   * @param author: ObjectId of the author of the group you're getting items from
   * @returns A list of the ObjectIds of the items contained in the specified group.
   * @throws NotFoundError If the group does not exist
   */
  async getItemsInGroup(label: String, author: ObjectId) {
    const objs = await this.groupitems.readMany({ label, author }, { projection: { item: 1 } });
    if (!objs){
      throw new NotFoundError(`Group named ${label} by author ${author} does not exist`)
    }
    const items = objs.map((obj) => obj.item);
    return items;
  }

  /**
   * 
   * @param item ObjectId of the item you want to search groups for
   * @returns A list of itemDocs containing the items
   * @throws NotFoundError if item is not contained in any groups
   */
  async getGroupsForItem(item: ObjectId) {
    const itemDocs = await this.groupitems.readMany({ item: item });
    if (!itemDocs){
      throw new NotFoundError(`item ${item} is not in any groups`);
    }
    return itemDocs;
    
  }

  /**
   * 
   * @param label Label of the group you're deleting
   * @param author: ObjectId of the author of the group you're deleting
   * @returns Success message
   */
  async deleteAllItemsInGroup(label: String, author: ObjectId) {
    await this.groupitems.deleteMany({ label, author });
    return { msg: "Deleted all instances of group!" };
  }

/**
 * Deletes an item from every group it is contained in
 * @param item ObjectId of the item to remove from all groups
 * @returns Success message
 */
  async deleteItemFromAllGroups(item: ObjectId) {
    await this.groupitems.deleteMany({ item });
    return { msg: "Deleted all instances of item!" };
  }

  /**
   * 
   * @param label Label of the group you're checking to see if the item is in
   * @param author: ObjectId of the author of the group checking to see if the item is in
   * @param item: The item you're checking if is in group
   */
  async assertItemInGroup(label: String, author: ObjectId, item: ObjectId) {
    const pair = await this.groupitems.readOne({ label, author, item });
    if (!pair) {
      throw new NotFoundError(`Item ${item} not in group named ${label} by author ${author}!`);
    }
  }
  /**
   * Get all the groups that a user in the author of
   * @param author ObjectId of the author to check
   * @returns A list of the labels of all the groups a user is the author of
   * @throws NotFoundError if user is not author of any groups
   */
  async getGroupsAuthord(author: ObjectId){
    const groups = await this.groupitems.readMany({author: author});
    if (!groups){
      throw new NotFoundError(`Author ${author} has not authored any groups!`)
    }
    const labels = groups.map(group => group.label);  //TODO Does not create list of unique titles, but can have repeats. Need to remember TS sets....
    return labels;
  }
}
