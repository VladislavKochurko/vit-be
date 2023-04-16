import { divideDatesRegex, divideYearRegex } from './constants.js';

export const getLatestDate = (curr: Date | string, acc: Date | string): Date | string => {
  return new Date(curr).getMilliseconds() > new Date(acc).getMilliseconds()
    ? curr : acc;
};

export const getDateString = (date: string): string => {
  const datesArray: string[] = date.match(divideYearRegex);
  const monthAndDay: string[] = datesArray[1].match(divideDatesRegex);

  return `${datesArray[0]}-${monthAndDay[0]}-${monthAndDay[1]}`;
};

export const getMonthsRange = (firstDate: Date, lastDate: Date): [number, number][] => {
  const firstMonth: number = firstDate.getMonth();
  const lastMonth: number = lastDate.getMonth();
  const firstYear: number = firstDate.getFullYear();
  const lastYear: number = lastDate.getFullYear();

  const dates: [year: number, month: number][] = [];
  for (let currentYear = firstYear; currentYear <= lastYear; currentYear++) {
    for (let currentMonth = currentYear === firstYear ? firstMonth : 0;
      currentMonth <= (currentYear === lastYear ? lastMonth : 11);
      currentMonth++) {
      dates.push([currentYear, currentMonth]);
    }
  }

  return dates;
};

export const isEqualDates = (firstDate: Date, secondDate: Date): boolean => {
  return firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate();
};
