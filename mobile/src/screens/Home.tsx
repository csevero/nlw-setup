import { useNavigation, useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useEffect, useState, useCallback } from 'react';
import { Text, View, ScrollView, Alert } from 'react-native';
import { DAY_SIZE, HabitDay } from '../components/HabitDay';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { api } from '../lib/axios';
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const datesFromYearStart = generateDatesFromYearBeginning();

const minimumSummaryDatesSize = 18 * 5;

const amountOfDaysToFill = minimumSummaryDatesSize - datesFromYearStart.length;

interface SummaryDataProps {
  id: string;
  date: string;
  completed: number;
  amount: number;
}
export function Home() {
  const { navigate } = useNavigation();

  const [summaryData, setSummaryData] = useState<SummaryDataProps[]>([]);
  const [loading, setLoading] = useState(true);

  async function getSummaryInformation() {
    try {
      setLoading(true);
      const { data } = await api.get('/summary');

      setSummaryData(data);
    } catch (err) {
      Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos');
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  // useFocusEffect is similar to useEffect, but it's used to execute a method when focus some screen, so it'll render the method always. It's recommended to execute it with useCallback to avoid many of renders on screens
  useFocusEffect(
    useCallback(() => {
      getSummaryInformation();
    }, []),
  );

  if (loading) return <Loading />;

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />
      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, index) => (
          <Text
            className="text-zinc-400 text-xl font-bold text-center mx-1"
            key={`${weekDay}-${index}`}
            style={{ width: DAY_SIZE }}
          >
            {weekDay}
          </Text>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summaryData && (
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map(date => {
              const dayInSummary = summaryData.find(day => {
                return dayjs(date).isSame(day.date, 'day');
              });

              return (
                <HabitDay
                  date={date}
                  amountOfHabits={dayInSummary?.amount}
                  amountCompleted={dayInSummary?.completed}
                  key={date.toISOString()}
                  onPress={() =>
                    navigate('habit', { date: date.toISOString() })
                  }
                />
              );
            })}

            {amountOfDaysToFill > 0 &&
              Array.from({ length: amountOfDaysToFill }).map((_, index) => (
                <View
                  key={index}
                  className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-50"
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                />
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
