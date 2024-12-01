import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

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

  /**
   * Make an instance of Rewarding
   * @param collectionName The name of the rewarding collection
   */
  public constructor(collectionName: string) {
    this.rewards = new DocCollection<RewardDoc>(collectionName);
  }

  async createReward(name: string, icon: string, user: string, project: ObjectId, task: ObjectId) {
    await this.assertUniqueNameForUser(name, user);
    await this.assertTaskHasNoReward(task);
    const _id = await this.rewards.createOne({ name, icon, user, project, task });
    return { msg: `Reward successfully created`, reward: _id };
  }

  /**
   * Get a user's rewards
   * @param user Username of the user to check for
   * @returns A list of the rewards a user has
   */
  async getRewardsByUser(user: string) {
    const rewards = await this.rewards.readMany({ user });
    return rewards;
  }

  /**
   * Get a project's rewards
   * @param project The objectId of the project to check for
   * @returns A list of rewards for that project
   */
  async getRewardsByProject(project: ObjectId) {
    const rewards = await this.rewards.readMany({ project });
    return rewards;
  }

  /**
   * Get's the reward assigned to a certain task
   * @param task The task to check for a reward
   * @returns The reward associated with the task
   * @throws NotFoundError if no reward is associated with that task
   */
  async getRewardByTask(task: ObjectId) {
    const reward = this.rewards.readOne({ task });
    if (!reward) {
      throw new NotFoundError(`Task ${task} has no reward associated`);
    }
    return reward;
  }

  /**
   * Check if a user already has a certain reward
   * @param name The name of the reward to check for
   * @param user The username of the user to check for
   * @throws NotAllowedError if the user already has a reward with that name
   */
  private async assertUniqueNameForUser(name: string, user: string) {
    const result = await this.rewards.readOne({ name: name, user: user });
    if (result) {
      throw new NotAllowedError(`User: ${user} already has reward ${name}`);
    }
  }

  /**
   * Check if a task already has a reward assigned to it
   * @param task The task to check
   * @throws NotAllowedError if task already has a reward
   */
  private async assertTaskHasNoReward(task: ObjectId) {
    const result = await this.rewards.readOne({ task });
    if (result) {
      throw new NotAllowedError(`Task ${task} already has a reward!`);
    }
  }
}
