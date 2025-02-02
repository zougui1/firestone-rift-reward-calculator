import { useSelector } from '@xstate/store/react';

import { cn, MainLayout, Typography } from '@zougui/react.ui';

import { RewardTable } from './components/RewardTable';
import { RewardInput } from './components/RewardInput';
import { store } from './store';
import { type RewardsObject } from './types';
import { CopyButton } from './components/CopyButton';
import { arrayToCsv } from './utils';

const Rewards = ({ className }: { className?: string }) => {
  const rewards = useSelector(store, state => state.context.totalRewards);

  const handleRewardChange = (name: keyof RewardsObject) => (value: number) => {
    store.send({
      type: 'updateReward',
      name,
      value,
    });
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <RewardInput
       icon="/GameToken.webp"
       alt="Token"
       value={rewards.token}
       onChange={handleRewardChange('token')}
      />
      <RewardInput
       icon="/CurrencyStrangeDust.webp"
       alt="Dust"
       value={rewards.dust}
       onChange={handleRewardChange('dust')}
      />
      <RewardInput
       icon="/CurrencyContract.webp"
       alt="Contract"
       value={rewards.contract}
       onChange={handleRewardChange('contract')}
      />
      <RewardInput
       icon="/TomeOfPowerKramatak.webp"
       alt="Tome"
       value={rewards.tome}
       onChange={handleRewardChange('tome')}
      />
    </div>
  );
}

const getCsv = () => {
  const { context } = store.getSnapshot();

  const output = context.rewardResult.rewards.map(reward => {
    return {
      name: context.users[reward.id]?.name ?? reward.name,
      damage: `${reward.damage}%`,
      token: reward.token,
      dust: reward.dust,
      contract: reward.contract,
      tome: reward.tome,
    };
  });

  return arrayToCsv(output);
}

export const App = () => {
  return (
    <MainLayout.Screen className={cn('dark')}>
      <MainLayout.Container>
        <main className="flex flex-col w-full items-center">
          <Typography.H1>Chaos Rift Reward Calculator</Typography.H1>
          <Rewards className="pb-8" />

          <div className="flex justify-end w-full">
            <CopyButton getTextContent={getCsv}>
              Copy as CSV
            </CopyButton>
          </div>

          <RewardTable />
        </main>
      </MainLayout.Container>
    </MainLayout.Screen>
  );
};
