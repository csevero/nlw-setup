import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma';
import { z } from 'zod';

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    //it will return the date with zero hours for example 01-10-23 00:00:00
    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(weekDay => ({
            week_day: weekDay,
          })),
        },
      },
    });
  });

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf('day');

    const weekDay = parsedDate.get('day');

    const possibleHabits = await prisma.habit.findMany({
      //using where with and condition
      where: {
        created_at: {
          lte: date,
        },
        //our weekDays is an array so we're using the some to get just the day the we need
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      //getting the the dayHabits that's a related table and bring just the habit_id field using the select, or if we want to bring all data we can put just dayHabits: true
      include: {
        dayHabits: {
          select: {
            habit_id: true
          }
        },
      },
    });

    const completedHabits = day?.dayHabits.map(dayHabit => dayHabit.habit_id);

    return {
      possibleHabits,
      completedHabits,
    };
  });
}
