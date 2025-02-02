import { useMemo } from 'react';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { isEqual } from 'radash';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, Button, Input, cn, Dropdown } from '@zougui/react.ui';
import { Reward } from './Reward';
import { useSelector } from '@xstate/store/react';
import { store } from '../store';

const columns: ColumnDef<string>[] = [
  {
    accessorKey: 'name',
    header: () => {
      return (
        <span className="flex items-center">
          <span className="w-12">Rank</span>
          <span>Name</span>
        </span>
      );
    },
    cell: function NameCell({ row }) {
      const userId = row.original;
      const user = useSelector(store, state => state.context.users[userId]);

      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        store.send({
          type: 'updateUserName',
          id: userId,
          value: event.currentTarget.value,
        });
      }

      return (
        <span className="flex items-center">
          <span className="w-12">{row.index + 1}</span>

          <Input
            ref={e => !user.name && e?.focus()}
            value={user.name}
            onChange={handleChange}
            className="max-w-[25ch]"
          />
        </span>
      );
    },
  },
  {
    accessorKey: 'damage',
    header: 'Damage (%)',
    cell: function DamageCell({ row }) {
      const userId = row.original;
      const user = useSelector(store, state => state.context.users[userId]);

      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        store.send({
          type: 'updateUserDamage',
          id: userId,
          value: event.currentTarget.value,
        });
      }

      return (
        <Input
          value={user.damage ?? ''}
          onChange={handleChange}
          className="w-28"
        />
      );
    },
  },
  {
    id: 'rewards',
    header: function Rewards() {
      const totalRewards = useSelector(store, state => state.context.totalRewards);
      const rewarded = useSelector(store, state => state.context.rewardResult.totalRewarded);

      return (
        <div className="flex items-center gap-4">
          <span>Rewards:</span>

          <Reward
            icon="/GameToken.webp"
            alt="Token"
            value={rewarded.token}
            className={cn({
              'text-destructive': rewarded.token > totalRewards.token,
            })}
          />
          <Reward
            icon="/CurrencyStrangeDust.webp"
            alt="Dust"
            value={rewarded.dust}
            className={cn({
              'text-destructive': rewarded.dust > totalRewards.dust,
            })}
          />
          <Reward
            icon="/CurrencyContract.webp"
            alt="Contract"
            value={rewarded.contract}
            className={cn({
              'text-destructive': rewarded.contract > totalRewards.contract,
            })}
          />
          <Reward
            icon="/TomeOfPowerKramatak.webp"
            alt="Tome"
            value={rewarded.tome}
            className={cn({
              'text-destructive': rewarded.tome > totalRewards.tome,
            })}
          />
        </div>
      );
    },
    cell: function Rewards({ row }) {
      const userId = row.original;
      const user = useSelector(store, state => state.context.users[userId]);
      const rewards = useSelector(store, state => state.context.rewardResult.rewards.find(r => r.id === user.id));

      return (
        <div className="flex items-center gap-4">
          <Reward
            icon="/GameToken.webp"
            alt="Token"
            value={rewards?.token ?? 0}
          />
          <Reward
            icon="/CurrencyStrangeDust.webp"
            alt="Dust"
            value={rewards?.dust ?? 0}
          />
          <Reward
            icon="/CurrencyContract.webp"
            alt="Contract"
            value={rewards?.contract ?? 0}
          />
          <Reward
            icon="/TomeOfPowerKramatak.webp"
            alt="Tome"
            value={rewards?.tome ?? 0}
          />
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => {
      const handleClick = () => {
        store.send({
          type: 'addUser',
          id: nanoid(),
          name: '',
          damage: '',
        });
      }

      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="ml-3.5 h-8 w-8 p-0"
            onClick={handleClick}
          >
            <span className="sr-only">New</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      );
    },

    cell: ({ row }) => {
      const userId = row.original;

      return (
        <div className="flex justify-end">
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </Dropdown.Trigger>

            <Dropdown.Content>
              <Dropdown.Item onClick={() => store.send({ type: 'deleteUser', id: userId })}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                <span>Delete user</span>
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </div>
      );
    },
  },
];

export const RewardTable = () => {
  const userIds = useSelector(store, state => Object.keys(state.context.users), isEqual);

  return useMemo(() => {
    return (
      <DataTable.Root
        columns={columns}
        data={userIds}
        pageSize={100}
      >
        <DataTable.Content>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Content>
      </DataTable.Root>
    );
  }, [userIds]);
}
