import { CovidLinks } from '../../common/enums/covid.links.js';
import {
  ICovidGeneral,
  ICovidHistoryResponse, ICovidOverview,
  ICovidPlace,
  ICovidPlacesResponse, IPredictionResponse,
} from '../../common/interfaces/covid.interfaces';
import { getDateString, getLatestDate, getMonthsRange, isEqualDates } from '../../utils/utils.js';
import covidEndpoints from '../../common/services/link-creator/covid.link-creator.js';
import { initialCovidPlace } from '../../utils/constants.js';
import CountryHistoryOverview from '../../common/entities/CountryHistoryOverview.js';
import httpRequest from '../../common/services/fetch.js';
import { ICountryInfo } from '../../common/interfaces/countries.interfaces';

export default class CovidService {
  public static async getGeneralInfo(): Promise<ICovidGeneral> {
    const countriesList: ICovidPlace[] = await this.getCountriesList();
    return this.getStatFromList(countriesList) as ICovidGeneral;
  }

  public static async getAllCountriesInfo(): Promise<[ICovidPlace[], ICovidPlace[]]> {
    const list: ICovidPlace[] = await this.getCountriesList();
    return [list, this.generateUniqueList(list)];
  }

  public static async getCountryInfo(iso2: string): Promise<ICovidPlace> {
    const countryList: ICovidPlace[] = await this.getCountriesList();

    // Some countries provide data for regions, so we should handle this case
    const query: ICovidPlace[] = countryList.filter((country: ICovidPlace) => country.country === iso2);
    return this.getStatFromList(query);
  }

  public static async getCountryHistoryOverview(iso2: string, countryInfo: ICountryInfo): Promise<CountryHistoryOverview> {
    const countries: ICovidPlace[] = await this.getCountriesList();
    const currentCountries = countries.filter((c: ICovidPlace) => c.country === iso2);

    if (currentCountries.length > 1) {
      const response = await Promise.all(currentCountries.map((c: ICovidPlace) => this.getCountryHistory(c.id)));
      const countryHistories = response.map((i: ICovidHistoryResponse) => this.getOverview(i.data.history));
      return CountryHistoryOverview.toResponse(
        countryInfo.name.common,
        iso2,
        response[0].data.lastUpdated as string,
        CountryHistoryOverview.mapMultipleHistories(countryHistories.flat()),
      );
    } else {
      const countryHistory = await this.getCountryHistory(currentCountries[0].id);
      return CountryHistoryOverview.toResponse(
        countryHistory.data.name,
        iso2,
        countryHistory.data.lastUpdated as string,
        this.getOverview(countryHistory.data.history),
      );
    }
  }

  public static async getCountryHistories(iso2: string, countryInfo: ICountryInfo, toPrediction: boolean = false): Promise<any> {
    const countries: ICovidPlace[] = await this.getCountriesList();
    const currentCountries = countries.filter((c: ICovidPlace) => c.country === iso2);

    if (currentCountries.length > 1) {
      const response = await Promise.all(currentCountries.map((c: ICovidPlace) => this.getCountryHistory(c.id)));
      const countryHistories = response.map((i: ICovidHistoryResponse) => i.data.history);
      return toPrediction
        ? CountryHistoryOverview.toPrediction(
          countryInfo.name.common,
          iso2,
          response[0].data.lastUpdated as string,
          CountryHistoryOverview.historyToPrediction(CountryHistoryOverview.mapMultipleHistories(countryHistories.flat())),
        )
        : CountryHistoryOverview.toResponse(
          countryInfo.name.common,
          iso2,
          response[0].data.lastUpdated as string,
          CountryHistoryOverview.mapMultipleHistories(countryHistories.flat())
            .map((i: ICovidOverview) => {
              i.day = new Date(getDateString(i.day as string));
              return { ...i };
            }),
        );
    } else {
      const countryHistory = await this.getCountryHistory(currentCountries[0].id);
      return toPrediction
        ? CountryHistoryOverview.toPrediction(
          countryInfo.name.common,
          iso2,
          countryHistory.data.lastUpdated as string,
          CountryHistoryOverview.historyToPrediction(countryHistory.data.history.reverse()),
        )
        : CountryHistoryOverview.toResponse(
          countryInfo.name.common,
          iso2,
          countryHistory.data.lastUpdated as string,
          countryHistory.data.history.reverse().map((i: ICovidOverview) => {
            i.day = new Date(getDateString(i.day as string));
            return { ...i };
          }),
        );
    }
  }

  public static preparePredictionData(data): IPredictionResponse {
    data.history = CountryHistoryOverview.historyToResponse(data.history);
    data.predicted = CountryHistoryOverview.predictionToResponse(data.predicted, data.history, data.accuracy);
    return data;
  }

  public static async getCountryHistory(id: string): Promise<ICovidHistoryResponse> {
    return httpRequest<ICovidHistoryResponse>(`${covidEndpoints.get(CovidLinks.GeneralInfo)}?id=${id}`, {
      Authorization: `Bearer ${process.env.COVID_API_TOKEN}`,
    });
  }

  public static async getCountriesList(): Promise<ICovidPlace[]> {
    const countryList: ICovidPlacesResponse = await httpRequest<ICovidPlacesResponse>(covidEndpoints.get(CovidLinks.Places), {
      Authorization: `Bearer ${process.env.COVID_API_TOKEN}`,
    });
    return countryList.data;
  }

  private static generateUniqueList(list: ICovidPlace[]): ICovidPlace[] {
    const uniqueList = new Map<string, ICovidPlace>();

    list.forEach((country: ICovidPlace) => {
      const { id, country: countryName, name } = country;
      const item = uniqueList.get(country.country);
      if (item) {
        uniqueList.set(country.country, { id, country: countryName, name,  ...this.getStatFromList([item, country]) });
      } else {
        uniqueList.set(country.country, country);
      }
    });

    return [...uniqueList].map(([_, country]: [string, ICovidPlace]) => country);
  }

  private static getStatFromList(list: ICovidPlace[]): ICovidPlace {
    return list.reduce((acc: ICovidPlace, curr: ICovidPlace) => {
      acc.dead += curr.dead;
      acc.sick += curr.sick;
      acc.recovered += curr.recovered;
      acc.infected += curr.infected;
      acc.vaccinated += curr.vaccinated;
      acc.lastUpdated = getLatestDate(curr.lastUpdated, acc.lastUpdated) ?? curr.lastUpdated;

      return acc;
    }, Object.assign({}, initialCovidPlace));
  }

  private static getOverview(history: ICovidOverview[]): ICovidOverview[] {
    const firstDate = new Date(getDateString(history[history.length - 1].day as string));
    const lastDate = new Date(getDateString(history[0].day as string));

    const overview: ICovidOverview[] = [];
    const monthsRange = getMonthsRange(firstDate, lastDate);
    monthsRange.forEach(([year, month]: [number, number], idx: number) => {
      const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
      const lastDayOfMonth = idx === monthsRange.length - 1
        ? lastDate
        : new Date(Date.UTC(year, month + 1, 0));

      const recordsForFirstDay = history.find((record: ICovidOverview) =>
        isEqualDates(new Date(getDateString(record.day as string)), firstDayOfMonth));
      let recordsForLastDay = history.find((record: ICovidOverview) =>
        isEqualDates(new Date(getDateString(record.day as string)), lastDayOfMonth));

      if (!recordsForLastDay) {
        recordsForLastDay = history
          .filter((record: ICovidOverview) => {
            const date = new Date(getDateString(record.day as string));
            return date.getFullYear() === lastDayOfMonth.getFullYear() && date.getMonth() === lastDayOfMonth.getMonth();
          })
          // @ts-ignore
          .sort((a: ICovidOverview, b: ICovidOverview) => new Date(getDateString(b.day as string)) - new Date(getDateString(a.day as string)))[0];
      }

      overview.push(CountryHistoryOverview.historyOverviewToResponse(recordsForFirstDay, recordsForLastDay));
    });

    return overview;
  }
}
