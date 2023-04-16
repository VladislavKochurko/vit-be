import { dirname } from 'path';
import { ICovidPlace } from '../common/interfaces/covid.interfaces';

export const initialCovidPlace = {
  dead: 0, sick: 0, recovered: 0, infected: 0, vaccinated: 0,
} as ICovidPlace;

export const divideYearRegex: RegExp = /.{1,4}/g;
export const divideDatesRegex: RegExp = /.{2}/g;

export const allowedDomains = ['http://localhost:4200'];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const __dirname = dirname('./');

export const maxLogFiles = 4;
export const maxLogFilesSize = 5242880;

