import { ICountryInfo } from '../interfaces/countries.interfaces';
import { ICovidPlace } from '../interfaces/covid.interfaces';

export default class CountryBasicInfo {
  countryId: string;
  name: string;
  iso2: string;
  iso3: string;
  population: number;
  flag: string;
  infected: number;
  sick: number;
  dead: number;
  recovered: number;
  vaccinated: number;
  lastUpdated: Date | string;
  isVisible: boolean;

  public static toResponse(countryInfo: Partial<ICountryInfo>, covidInfo: Partial<ICovidPlace>): CountryBasicInfo {
    const response: CountryBasicInfo = new CountryBasicInfo();

    response.name = countryInfo.name.common;
    response.iso2 = countryInfo.cca2;
    response.iso3 = countryInfo.cca3;
    response.population = countryInfo.population;
    response.flag = countryInfo.flags.svg;

    if (!covidInfo) {
      response.isVisible = false;
      return response;
    }

    response.isVisible = true;
    response.countryId = covidInfo.id;
    response.infected = covidInfo.infected;
    response.sick = covidInfo.sick;
    response.dead = covidInfo.dead;
    response.recovered = covidInfo.recovered;
    response.vaccinated = covidInfo.vaccinated;
    response.lastUpdated = covidInfo.lastUpdated;

    return response;
  }
}
