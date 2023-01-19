import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning';
import { HabitDay } from './HabitDay';
import { api } from '../lib/axios';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const summaryDates = generateDatesFromYearBeginning();

const minimumSummaryDatesSize = 18 * 7;

const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

interface SummaryDataProps {
  id: string;
  date: string;
  completed: number;
  amount: number;
}

export function SummaryTable() {
  const [summaryData, setSummaryData] = useState<SummaryDataProps[]>([]);

  useEffect(() => {
    async function getSummaryInformation() {
      const { data } = await api.get('/summary');

      setSummaryData(data);
    }

    getSummaryInformation();
  }, []);
  return (
    <div className="w-full flex ">
      <div className="grid grid-rows-7 grid-flow-row gap-3">
        {weekDays.map((weekDay, index) => {
          return (
            <div
              className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center"
              key={`${weekDay}-${index}`}
            >
              {weekDay}
            </div>
          );
        })}
      </div>
      <div className="grid grid-rows-7 grid-flow-col gap-3">
        {summaryDates.map(date => {
          const dayInSummary = summaryData.find(day => {
            return dayjs(date).isSame(day.date, 'day');
          });

          return (
            <HabitDay
              amount={dayInSummary?.amount}
              completed={dayInSummary?.completed}
              date={date}
              key={date.toString()}
            />
          );
        })}

        {amountOfDaysToFill > 0 &&
          Array.from({ length: amountOfDaysToFill }).map((_, index) => {
            return (
              <div
                key={index}
                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
              />
            );
          })}
      </div>
    </div>
  );
}
