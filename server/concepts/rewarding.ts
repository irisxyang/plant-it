import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface RewardDoc extends BaseDoc {
  name: string; // name of reward
  icon: string; // link/path to reward icon (randomly selected from a set of icon options)
  user: ObjectId; // user it is associated with
  project: ObjectId; // project it is associated with
  task: ObjectId; // task it is associated with
}

// TODO: create mapping of reward names to paths
const icons: Map<string, string> = new Map<string, string>([["TODO: Reward name", "TODO: link/path to icon here"]]);

/**
 * concept Rewarding [User, Project, Task]
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

  async createReward(user: ObjectId, project: ObjectId, task: ObjectId) {
    // get a random icon name that user doesn't already have
    const userRewards = new Set((await this.getRewardsByUser(user)).map((reward) => reward.name));
    const newRewards = Array.from(icons.keys()).filter((iconName) => !userRewards.has(iconName));
    if (newRewards.length === 0) {
      throw new NotAllowedError(`You have already reached the maximum number of rewards (${userRewards.size})`);
    }
    await this.assertTaskHasNoReward(task);
    // select random name and icon
    const name = newRewards[Math.floor(Math.random() * newRewards.length)];
    const icon = icons.get(name);
    const _id = await this.rewards.createOne({ name, icon, user, project, task });
    const reward = await this.rewards.readOne({ _id });
    if (!reward) {
      throw new NotFoundError(`Reward ${_id} could not be found after creation!`);
    }
    return { msg: `Reward successfully created`, reward };
  }

  /**
   * Get a user's rewards
   * @param user Username of the user to check for
   * @returns A list of the rewards a user has
   */
  async getRewardsByUser(user: ObjectId) {
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
   * Get the reward assigned to a certain task
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
   * Delete a reward
   * @param _id The id of the reward to delete
   * @returns Success message
   */
  async deleteReward(_id: ObjectId) {
    await this.rewards.deleteOne({ _id });
    return { msg: "Reward deleted successfully!" };
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
