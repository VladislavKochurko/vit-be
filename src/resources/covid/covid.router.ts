import express, { Router } from 'express';
import {
  ICovidGeneral,
  ICovidPlace, IPredictionResponse,
} from '../../common/interfaces/covid.interfaces';
import CovidService from './covid.service.js';
import CountriesService from '../countries/countries.service.js';
import { ICountryInfo } from '../../common/interfaces/countries.interfaces';
import Predictions from '../../common/models/CountryPrediction.js';

const router = Router();

router.get('/general', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const info: ICovidGeneral = await CovidService.getGeneralInfo();
    res.status(200).json({ ...info });
  } catch (e: unknown) {
    next(e);
  }
});

router.get('/countries', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const countries: ICovidPlace[] = await CovidService.getCountriesList();
    res.status(200).json(countries);
  } catch (e: unknown) {
    next(e);
  }
});

router.get('/history', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { country } = req.query;
    const countryInfo: ICountryInfo = await CountriesService.getCountryInfo(country as string);
    res.status(200).json(await CovidService.getCountryHistories(country as string, countryInfo));
  } catch (e: unknown) {
    next(e);
  }
});

router.get('/overview', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { country } = req.query;
    const countryInfo: ICountryInfo = await CountriesService.getCountryInfo(country as string);
    const overview = await CovidService.getCountryHistoryOverview(country as string, countryInfo);
    res.status(200).json(overview);
  } catch (e: unknown) {
    next(e);
  }
});

router.get('/prediction-data', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { country } = req.query;
    const countryInfo: ICountryInfo = await CountriesService.getCountryInfo(country as string);
    res.status(200).json(await CovidService.getCountryHistories(country as string, countryInfo, true));
  } catch (e: unknown) {
    next(e);
  }
});

router.get('/predicted', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { country } = req.query;
    const dbQuery = await Predictions.find({ iso2: country }, { _id: 0 });
    const data: IPredictionResponse = CovidService.preparePredictionData({ ...dbQuery[0]._doc });
    res.status(200).json(data);
  } catch (e: unknown) {
    next(e);
  }
});

export default router;
