import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface RewardDoc extends BaseDoc {
  name: string; // name of reward
  icon: string; // link/path to reward icon (randomly selected from a set of icon options)
  user: string; // username it is associated with
  project: ObjectId; // project it is associated with
  task: ObjectId; // task it is associated with
}

// TODO: create icons and link paths
const icons: Set<string> = new Set<string>(["TODO: links/paths to icons here"]);

/**
 * Rewarding concept
 *
 * TODO
 *
 * idea is we create rewards every time a task is completed
 * we can only have one reward per task (so we cannot have repeat rewards gifted
 * if a task is marked incomplete/complete)
 *
 * on the project page, we get rewards by project and display all of them
 *
 * on the user page, we get rewards by user and display all of them
 *
 * could be cool to add a on-hover feature that displays the task text corresponding
 * to the reward
 *
 */
export default class RewardingConcept {
  public readonly rewards: DocCollection<RewardDoc>;

  public constructor(collectionName: string) {
    this.rewards = new DocCollection<RewardDoc>(collectionName);
  }

  // create new reward with name, icon, user id, project id, task id
  // check if reward already exists for a given task

  // get reward for user

  // get reward for project

  // assert task reward already exists --> to be used in create reward fn
  // i.e., if the task alr has an associated reward, we don't re-reward for the same task
}
