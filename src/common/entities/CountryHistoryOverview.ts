import {
  ICovidGeneral,
  ICovidOverview,
  ICovidPredictionOverview,
  ICovidPredictionOverviewData, IPredictionAccuracy,
} from '../interfaces/covid.interfaces';
import { initialCovidPlace } from '../../utils/constants.js';
import { getDateString, isEqualDates } from '../../utils/utils.js';

export default class CountryHistoryOverview {
  private name: string;
  private iso2: string;
  private lastUpdated: string;
  private history: ICovidOverview[];

  public static toResponse(name: string, iso2: string, lastUpdated: string, history: ICovidOverview[]): CountryHistoryOverview {
    const response = new CountryHistoryOverview();

    response.name = name;
    response.iso2 = iso2;
    response.lastUpdated = lastUpdated;
    response.history = history;

    return response;
  }

  public static historyOverviewToResponse(firstRecord: ICovidOverview, secondRecord: ICovidOverview): ICovidOverview {
    const response = {} as ICovidOverview;
    const date = new Date(getDateString((firstRecord?.day || secondRecord?.day) as string));

    this.getDifference(firstRecord, secondRecord, response);
    response.day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));

    return response;
  }

  public static historyToResponse(history: ICovidPredictionOverviewData[]): ICovidOverview[] {
    return history.map((i: ICovidPredictionOverviewData) => ({
      day: new Date(getDateString(i.day)),
      dead: i.dailyDead,
      infected: i.dailyInfected,
      recovered: i.dailyRecovered,
    }) as ICovidOverview);
  }

  public static predictionToResponse(predicted: ICovidPredictionOverviewData[], history: ICovidOverview[], accuracy: IPredictionAccuracy): ICovidOverview[] {
    let result: ICovidOverview[] = predicted.map((i: ICovidPredictionOverviewData) => ({ day: new Date(getDateString(i.day as string)) })) as ICovidOverview[];
    if (Math.abs(1 - accuracy.dailyDead) <= Math.abs(1 - accuracy.weeklyDead)) {
      result.forEach((i: ICovidOverview, index: number) => {
        i.dead = predicted[index].dailyDead;
      });
    } else {
      result.forEach((i: ICovidOverview, index: number) => {
        i.dead = predicted[index].weeklyDead + history[history.length - 7 + index].dead;
      });
      result = result.map((i: ICovidOverview, index: number) => {
        const res = i.dead - (result[index - 1] || history[history.length - 1]).dead;
        return { ...i, dead: res >= 0 ? res : predicted[index].dailyDead };
      });
    }

    if (Math.abs(1 - accuracy.dailyInfected) <= Math.abs(1 - accuracy.weeklyInfected)) {
      result.forEach((i: ICovidOverview, index: number) => {
        i.infected = predicted[index].dailyInfected;
      });
    } else {
      result.forEach((i: ICovidOverview, index: number) => {
        i.infected = predicted[index].weeklyInfected + history[history.length - 7 + index].infected;
      });
      result = result.map((i: ICovidOverview, index: number) => {
        const res = i.infected - (result[index - 1] || history[history.length - 1]).infected;
        return { ...i, infected: res >= 0 ? res : predicted[index].dailyInfected };
      });
    }

    if (Math.abs(1 - accuracy.dailyRecovered) <= Math.abs(1 - accuracy.weeklyRecovered)) {
      result.forEach((i: ICovidOverview, index: number) => {
        i.recovered = predicted[index].dailyRecovered;
      });
    } else {
      result.forEach((i: ICovidOverview, index: number) => {
        i.recovered = predicted[index].weeklyRecovered + history[history.length - 7 + index].recovered;
      });
      result = result.map((i: ICovidOverview, index: number) => {
        const res = i.recovered - (result[index - 1] || history[history.length - 1]).recovered;
        return { ...i, recovered: res >= 0 ? res : predicted[index].dailyRecovered };
      });
    }

    return result;
  }

  public static mapMultipleHistories(histories: ICovidOverview[]): ICovidOverview[] {
    return histories
      .reduce((acc: ICovidOverview[], curr: ICovidOverview) => {
        const item = acc.find((i: ICovidOverview) => i.day === curr.day || isEqualDates(new Date(i.day), new Date(curr.day)));
        if (item) {
          item.sick += curr.sick;
          item.recovered += curr.recovered;
          item.dead += curr.dead;
          item.vaccinated += curr.vaccinated;
          item.infected += curr.infected;
        } else {
          acc.push(curr);
        }
        return acc;
      }, [])
      // @ts-ignore
      .sort((a: ICovidOverview, b: ICovidOverview) => a.day - b.day);
  }

  public static toPrediction(name: string, iso2: string, lastUpdated: string, history: ICovidPredictionOverviewData[]): ICovidPredictionOverview {
    return {
      name,
      iso2,
      lastUpdated,
      history,
    } as ICovidPredictionOverview;
  }

  public static historyToPrediction(history: ICovidOverview[]): ICovidPredictionOverviewData[] {
    const result: ICovidPredictionOverviewData[] = [];
    history.forEach((i: ICovidOverview, idx: number, arr: ICovidOverview[]) => {
      const daily: ICovidPredictionOverviewData = {} as ICovidPredictionOverviewData;
      const previousRecord: ICovidOverview = arr[idx - 1];
      const weeklyAgoRecord: ICovidOverview = arr[idx - 7];

      daily.day = i.day as string;
      daily.dailyDead = i.dead - (previousRecord?.dead || 0);
      daily.dailyInfected = i.infected - (previousRecord?.infected || 0);
      daily.dailyRecovered = i.recovered - (previousRecord?.recovered || 0);
      daily.weeklyDead = weeklyAgoRecord ? i.dead - weeklyAgoRecord.dead : i.dead;
      daily.weeklyInfected = weeklyAgoRecord ? i.infected - weeklyAgoRecord.infected : i.infected;
      daily.weeklyRecovered = weeklyAgoRecord ? i.recovered - weeklyAgoRecord.recovered : i.recovered;

      result.push(daily);
    });
    return result;
  }

  private static getDifference(firstRecord: ICovidGeneral, secondRecord: ICovidGeneral, response: ICovidOverview): void {
    if (!firstRecord) {
      firstRecord = initialCovidPlace;
    } else if (!secondRecord) {
      secondRecord = initialCovidPlace;
    }
    response.infected = Math.abs(secondRecord.infected - firstRecord.infected);
    response.recovered = Math.abs(secondRecord.recovered - firstRecord.recovered);
    response.dead = Math.abs(secondRecord.dead - firstRecord.dead);
    response.vaccinated = Math.abs(secondRecord.vaccinated - firstRecord.vaccinated);
    response.sick = Math.abs(secondRecord.sick - firstRecord.sick);
  }
}