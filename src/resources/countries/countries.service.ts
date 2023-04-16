import { ICountryInfo } from '../../common/interfaces/countries.interfaces';
import countriesEndpoints from '../../common/services/link-creator/countries.link-creator.js';
import { CountriesLinks } from '../../common/enums/countries.links.js';
import httpRequest from '../../common/services/fetch.js';
import CountryBasicInfo from '../../common/entities/CountryBasicInfo.js';
import { ICovidPlace } from '../../common/interfaces/covid.interfaces';

export default class CountriesService {
  public static async getCountriesList(): Promise<ICountryInfo[]> {
    return httpRequest<ICountryInfo[]>(countriesEndpoints.get(CountriesLinks.All));
  }

  public static async getCountryInfo(iso2: string): Promise<ICountryInfo> {
    const countryList: ICountryInfo[] = await this.getCountriesList();
    return countryList.find((c: ICountryInfo) => c.cca2 === iso2);
  }

  public static mapCountriesToCovid(countries: ICountryInfo[], initCovidList: ICovidPlace[], covidCountriesList: ICovidPlace[]): CountryBasicInfo[] {
    return countries.map((country: ICountryInfo) => {
      let covidCountry: ICovidPlace = covidCountriesList.find((c: ICovidPlace) => c.country === country.cca2);
      if (!covidCountry) {
        covidCountry = initCovidList.find((c: ICovidPlace) => {
          // handle U.S Virgin Islands case
          const anotherName = country.altSpellings[country.altSpellings.length - 1].split(',').reverse().join(' ').trim();
          return c.name === country.name.common || c.name === anotherName;
        });
      }
      return CountryBasicInfo.toResponse(country, covidCountry);
    });
  }
}
