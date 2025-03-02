import { sort, sum } from 'radash';

import { type RewardsObject, type User } from '../types';

const fixedMinRewards = {
  token: 1,
  dust: 20,
  contract: 5,
  tome: 1,
} satisfies RewardsObject;

const percentMinRewards = {
  dust: 0.005,
  contract: 0.005,
} satisfies Partial<RewardsObject>;

const getMinReward = (total: number, fixed: number, percent: number): number => {
  return Math.max(fixed, Math.floor(total * percent));
}

export const calculateRewards = (totalRewards: RewardsObject, users: User[]): RewardResult => {
  if (!users.length) {
    return {
      totalRewarded: {
        token: 0,
        dust: 0,
        contract: 0,
        tome: 0,
      },
      rewards: [],
    };
  }

  const minRewards = {
    ...fixedMinRewards,
    dust: getMinReward(totalRewards.dust, fixedMinRewards.dust, percentMinRewards.dust),
    contract: getMinReward(totalRewards.contract, fixedMinRewards.contract, percentMinRewards.contract),
  };

  // highest damage first
  users = sort(users, user => user.damage, true);

  const rewards = users.map(user => {
    const mult = user.damage / 100;

    const token = totalRewards.token * mult;
    const dust = totalRewards.dust * mult;
    const contract = totalRewards.contract * mult;
    const tome = totalRewards.tome * mult;

    const shouldReceiveMinToken = token < minRewards.token;
    const shouldReceiveMinDust = dust < minRewards.dust;
    const shouldReceiveMinContract = contract < minRewards.contract;
    const shouldReceiveMinTome = tome < minRewards.tome;

    return {
      id: user.id,
      name: user.name,
      damage: user.damage,
      token: shouldReceiveMinToken ? minRewards.token : 0,
      dust: shouldReceiveMinDust ? minRewards.dust : 0,
      contract: shouldReceiveMinContract ? minRewards.contract : 0,
      tome: shouldReceiveMinTome ? minRewards.tome : 0,
      receivedMinRewards: shouldReceiveMinToken || shouldReceiveMinDust || shouldReceiveMinContract || shouldReceiveMinTome,
    };
  });

  const remainingRewards = {
    token: totalRewards.token - sum(rewards, r => r.token),
    dust: totalRewards.dust - sum(rewards, r => r.dust),
    contract: totalRewards.contract - sum(rewards, r => r.contract),
    tome: totalRewards.tome - sum(rewards, r => r.tome),
  };

  for (let index = 0; index < 100; index++) {
    const usersWithMinRewards = new Set(rewards.filter(user => !user.receivedMinRewards));

    if (!usersWithMinRewards.size) {
      break;
    }

    for (const user of rewards) {
      if (usersWithMinRewards.has(user)) {
        continue;
      }

      const mult = user.damage / 100;

      const token = remainingRewards.token * mult;
      const dust = remainingRewards.dust * mult;
      const contract = remainingRewards.contract * mult;
      const tome = remainingRewards.tome * mult;

      const shouldReceiveMinToken = token < minRewards.token;
      const shouldReceiveMinDust = dust < minRewards.dust;
      const shouldReceiveMinContract = contract < minRewards.contract;
      const shouldReceiveMinTome = tome < minRewards.tome;

      if (shouldReceiveMinToken) {
        user.token = minRewards.token;
      }
      if (shouldReceiveMinDust) {
        user.dust = minRewards.dust;
      }
      if (shouldReceiveMinContract) {
        user.contract = minRewards.contract;
      }
      if (shouldReceiveMinTome) {
        user.tome = minRewards.tome;
      }

      const hasAttributedMinRewards = shouldReceiveMinToken || shouldReceiveMinDust || shouldReceiveMinContract || shouldReceiveMinTome;

      if (hasAttributedMinRewards) {
        usersWithMinRewards.add(user);
      }
    }

    remainingRewards.token = totalRewards.token - sum(rewards, r => r.token);
    remainingRewards.dust = totalRewards.dust - sum(rewards, r => r.dust);
    remainingRewards.contract = totalRewards.contract - sum(rewards, r => r.contract);
    remainingRewards.tome = totalRewards.tome - sum(rewards, r => r.tome);
  }

  for (const reward of rewards) {
    const mult = reward.damage / 100;

    if (!reward.token) {
      reward.token = remainingRewards.token * mult;
    }

    if (!reward.dust) {
      reward.dust = remainingRewards.dust * mult;
    }

    if (!reward.contract) {
      reward.contract = remainingRewards.contract * mult;
    }

    if (!reward.tome) {
      reward.tome = remainingRewards.tome * mult;
    }
  }

  const receivedMinRewards = rewards.filter(r => !r.receivedMinRewards);
  const distributableRewards = receivedMinRewards.length ? receivedMinRewards : rewards;

  for (const name of Object.keys(totalRewards) as (keyof typeof totalRewards)[]) {
    // highest decimal first
    const sortedUsers = sort(distributableRewards, r => r[name] - Math.floor(r[name]), true);

    while (totalRewards[name] - sum(rewards.map(r => Math.floor(r[name]))) > 0) {
      const remainder = totalRewards[name] - sum(rewards.map(r => Math.floor(r[name])));

      if (remainder > 0) {
        for (const reward of sortedUsers.slice(0, remainder)) {
          reward[name]++;
        }
      }
    }
  }

  for (const reward of rewards) {
    reward.token = Math.floor(reward.token);
    reward.dust = Math.floor(reward.dust);
    reward.contract = Math.floor(reward.contract);
    reward.tome = Math.floor(reward.tome);
  }

  const totalRewarded = {
    token: sum(rewards.map(r => r.token)),
    dust: sum(rewards.map(r => r.dust)),
    contract: sum(rewards.map(r => r.contract)),
    tome: sum(rewards.map(r => r.tome)),
  };

  return {
    totalRewarded,
    rewards,
  };
}

export interface RewardResult {
  totalRewarded: RewardsObject;
  rewards: RewardedUser[];
}

export interface RewardedUser extends User, RewardsObject {
  receivedMinRewards: boolean;
}
