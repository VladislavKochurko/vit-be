import { CountriesLinks } from '../../enums/countries.links.js';

const COUNTRIES_API_URL = 'https://restcountries.com/v3.1';
const countriesEndpoints = new Map<string, string>();

const setUrl = (endpoint: string): string => `${COUNTRIES_API_URL}${endpoint}`;

countriesEndpoints.set(CountriesLinks.All, setUrl('/all'));

export default countriesEndpoints;
