export interface ICountryRequest {
  iso2: string;
  iso3: string;
}

export interface ICountryInfo {
  name: { common: string; };
  cca2: string;
  cca3: string;
  population: number;
  flags: { svg: string; };
  altSpellings: string[];
}
