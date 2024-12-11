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

const icons: Map<string, string> = new Map<string, string>([
  ["Flower 2", "reward2.svg"],
  ["Flower 3", "reward3.svg"],
  ["Flower 1", "reward1.svg"],
  ["Flower 4", "reward4.svg"],
  ["Flower 5", "reward5.svg"],
  ["Flower 6", "reward6.svg"],
  ["Flower 7", "reward7.svg"],
]);

/**
 * concept Rewarding [User, Project, Task]
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
    const userRewards = new Set((await this.getRewards({ user })).map((reward) => reward.name));
    const newRewards = Array.from(icons.keys()).filter((iconName) => !userRewards.has(iconName));

    if (newRewards.length === 0) {
      return { msg: `You have already reached the maximum number of rewards (${userRewards.size})` };
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
    return { msg: `You earned ${name}!`, reward };
  }

  /**
   * Get rewards by user, project, or task
   * @param user Username of the user to check for
   * @param project The objectId of the project to check for
   * @param task The task to check for a reward
   * @returns A list of the rewards found
   */
  async getRewards({ user, project, task }: { user?: ObjectId; project?: ObjectId; task?: ObjectId } = {}) {
    const query: { [key: string]: ObjectId } = {};

    if (user) {
      query.user = user;
    }
    if (project) {
      query.project = project;
    }
    if (task) {
      query.task = task;
    }

    const rewards = await this.rewards.readMany(query);
    return rewards;
  }

  /**
   * Delete a reward
   * @param _id The id of the reward to delete
   * @returns Success message
   */
  async deleteReward(_id: ObjectId) {
    const reward = await this.rewards.readOne({ _id });
    if (reward) {
      await this.rewards.deleteOne({ _id });
      return { msg: `You lost ${reward.name}!` };
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
