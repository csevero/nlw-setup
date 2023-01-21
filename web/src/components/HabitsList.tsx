import * as Checkbox from '@radix-ui/react-checkbox';
import dayjs from 'dayjs';
import { Check } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';

interface HabitListProps {
  date: Date;
  onCompletedChange: (completed: number) => void;
}

interface HabitsInfoProps {
  possibleHabits: Array<{
    id: string;
    title: string;
    create_at: string;
  }>;
  completedHabits: string[];
}

export function HabitsList({ date, onCompletedChange }: HabitListProps) {
  const [habitsInfo, setHabitsInfo] = useState<HabitsInfoProps>();

  useEffect(() => {
    async function getHabitsByDay() {
      const { data } = await api.get('/day', {
        params: {
          date: date.toISOString(),
        },
      });

      setHabitsInfo(data);
    }

    getHabitsByDay();
  }, []);

  const isDateInPast = dayjs(date).endOf('day').isBefore(new Date());

  async function handleToggleHabit(habitId: string) {
    await api.patch(`/habits/${habitId}/toggle`);

    const isHabitAlreadyCompleted =
      habitsInfo?.completedHabits.includes(habitId);

    let completedHabits: string[] = [];
    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(
        id => id !== habitId,
      );
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId];
    }

    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits,
    });

    onCompletedChange(completedHabits.length)
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {habitsInfo?.possibleHabits.map(habit => {
        return (
          <Checkbox.Root
            key={habit.id}
            className="flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed"
            checked={habitsInfo.completedHabits.includes(habit.id)}
            onCheckedChange={() => handleToggleHabit(habit.id)}
            disabled={isDateInPast}
          >
            {/* By default the radix elements always bring a html property data-*, with it we can know if component is active or no, in this case our styled component is the div inside of .Root, and it doesn't have this property data-*, so with tailwind we can add the property on className of father component, with it we can get information of father component inside of some children  */}
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:outline-none group-focus:ring-2 group-focus:ring-violet-600 group-focus:ring-offset-2 group-focus:ring-offset-background">
              {/* here we're checking if the group-data-[state=checked] on the Checkbox radix component when it's checked, it add a property on html element data-state that can be checked or unchecked, basically, if it is checked we added a background color to component */}
              <Checkbox.Indicator>
                <Check size={20} className="text-white" />
              </Checkbox.Indicator>
            </div>

            <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
              {habit.title}
            </span>
          </Checkbox.Root>
        );
      })}
    </div>
  );
}
