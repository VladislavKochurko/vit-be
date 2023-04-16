import express, { Router } from 'express';
import { ICountryInfo } from '../../common/interfaces/countries.interfaces';
import CountriesService from './countries.service.js';
import CovidService from '../covid/covid.service.js';
import CountryBasicInfo from '../../common/entities/CountryBasicInfo.js';
import { ICovidPlace } from '../../common/interfaces/covid.interfaces';

const router = Router();

router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const [countries, [initCovidList, covidCountriesList]]: [ICountryInfo[], [ICovidPlace[], ICovidPlace[]]] = await Promise.all([
      CountriesService.getCountriesList(),
      CovidService.getAllCountriesInfo(),
    ]);

    const response: CountryBasicInfo[] = CountriesService.mapCountriesToCovid(countries, initCovidList, covidCountriesList);
    res.status(200).json(response);
  } catch (e: unknown) {
    next(e);
  }
});

router.get('/:iso2', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const iso2: string = req.params.iso2;
    const [countries, [initCovidList, covidCountriesList]]: [ICountryInfo[], [ICovidPlace[], ICovidPlace[]]] = await Promise.all([
      CountriesService.getCountriesList(),
      CovidService.getAllCountriesInfo(),
    ]);
    const countriesList: CountryBasicInfo[] = CountriesService.mapCountriesToCovid(countries, initCovidList, covidCountriesList);
    const response = countriesList.find((c: CountryBasicInfo) => c.iso2 === (iso2 as string));

    res.status(200).json(response);
  } catch (e: unknown) {
    next(e);
  }
});

export default router;
