import { CovidLinks } from '../../enums/covid.links.js';

const COVID_API_URL = 'https://coronavirus.app/';
const covidEndpoints = new Map<string, string>();

const setUrl = (endpoint: string): string => `${COVID_API_URL}${endpoint}`;

covidEndpoints.set(CovidLinks.GeneralInfo, setUrl('get-history'));
covidEndpoints.set(CovidLinks.Places, setUrl('get-places'));

export default covidEndpoints;
