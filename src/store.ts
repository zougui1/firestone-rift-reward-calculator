import { createStore } from '@xstate/store';

import { type RewardsObject, type TableUser } from './types';
import { isNumber } from 'radash';
import { calculateRewards, RewardResult } from './utils';

const computeRewards = (rewards: RewardsObject, users: Record<string, TableUser>) => {
  const eligibleUsers = Object.values(users).map(user => {
    return {
      ...user,
      damage: Number(user.damage || 0),
    };
  });

  return calculateRewards(rewards, eligibleUsers);
}

export interface State {
  totalRewards: RewardsObject;
  users: Record<string, TableUser>;
  rewardResult: RewardResult;
}

export const store = createStore({
  context: {
    totalRewards: {
      token: 0,
      dust: 0,
      contract: 0,
      tome: 0,
    },
    users: {},
    rewardResult: {
      totalRewarded: {
        token: 0,
        dust: 0,
        contract: 0,
        tome: 0,
      },
      rewards: [],
    },
  } as State,

  on: {
    updateReward: (context, event: { name: keyof RewardsObject; value: number; }) => {
      const totalRewards = {
        ...context.totalRewards,
        [event.name]: event.value,
      };

      return {
        ...context,
        totalRewards,
        rewardResult: computeRewards(totalRewards, context.users),
      };
    },

    addUser: (context, event: TableUser) => {
      const newUsers = {
        ...context.users,
        [event.id]: event,
      };

      return {
        ...context,
        users: newUsers,
        rewardResult: computeRewards(context.totalRewards, newUsers),
      };
    },

    deleteUser: (context, event: { id: string }) => {
      const newUsers = { ...context.users };
      delete newUsers[event.id];

      return {
        ...context,
        users: newUsers,
        rewardResult: computeRewards(context.totalRewards, newUsers),
      };
    },

    updateUserName: {
      users: (context, event: { id: string; value: string; }) => {
        return {
          ...context.users,
          [event.id]: {
            ...context.users[event.id],
            name: event.value,
          },
        };
      },
    },

    updateUserDamage: (context, event: { id: string; value: string; }) => {
      // don't update the user if the value is not an empty value or a valid number
      if (event.value && !isNumber(Number(event.value))) {
        return context.users;
      }

      const newUsers = {
        ...context.users,
        [event.id]: {
          ...context.users[event.id],
          damage: event.value,
        },
      };

      return {
        ...context,
        users: newUsers,
        rewardResult: computeRewards(context.totalRewards, newUsers),
      };
    },
  },
});
