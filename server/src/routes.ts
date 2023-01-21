import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma';
import { z } from 'zod';

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async request => {
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

  app.get('/day', async request => {
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
            habit_id: true,
          },
        },
      },
    });

    const completedHabits = day?.dayHabits.map(dayHabit => dayHabit.habit_id) ?? [];

    return {
      possibleHabits,
      completedHabits,
    };
  });

  app.patch('/habits/:id/toggle', async request => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = toggleHabitParams.parse(request.params);

    const today = dayjs().startOf('day').toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }

    //checking if the user already checked the habit how completed
    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });

  app.get('/summary', async () => {
    //$queryRaw allow us to write raw queies
    const summary = await prisma.$queryRaw`
    SELECT 
      D.id, 
      D.date,
      (
        SELECT 
        -- converting the count(*) that by default is a bigInt to float using the cast
        cast(count(*) as float)
        FROM day_habits DH
        WHERE DH.day_id = D.id
      ) as completed,
      (
        SELECT 
          cast(count(*) as float)
        FROM habit_week_days HWD
        JOIN habits H
          ON H.id = HWD.habit_id
        WHERE
         -- using the strftime to transform the default format date of sqlite to get just the week day that is the information that we store on database. We're dividing the D.date by 1000 because the sqlite stores the data how milliseconds so we need to get it how seconds
          HWD.week_day = cast(strftime('%w', D.date/1000, 'unixepoch') as int)
          AND H.created_at <= D.date
      ) as amount
    FROM days D
    `;

    return summary;
  });
}
