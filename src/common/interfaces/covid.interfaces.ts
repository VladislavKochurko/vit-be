export interface ICovidPlacesResponse {
  data: ICovidPlace[];
}

export interface ICovidHistoryResponse {
  data: Pick<ICovidPlace, 'id' | 'name' | 'country' | 'lastUpdated'> & ICovidHistory;
}

export interface ICovidHistory {
  history: ICovidOverview[];
}

export interface ICovidPlace extends ICovidGeneral {
  id: string;
  name: string;
  country: string; // iso2
}

export interface ICovidOverview extends ICovidGeneral {
  _id?: string;
  day: Date | string;
}

export interface ICovidPredictionOverviewData {
  _id?: string;
  day: string;
  dailyDead: number;
  dailyInfected: number;
  dailyRecovered: number;
  weeklyDead: number;
  weeklyInfected: number;
  weeklyRecovered: number;
}

export interface ICovidPredictionOverview {
  name: string;
  iso2: string;
  history: ICovidPredictionOverviewData[];
}

export interface ICovidPrediction extends ICovidPredictionOverview {
  predicted: ICovidPredictionOverviewData[];
}

export interface IPredictionAccuracy {
  dailyDead: number;
  dailyInfected: number;
  dailyRecovered: number;
  weeklyDead: number;
  weeklyInfected: number;
  weeklyRecovered: number;
}

export interface IPredictionResponse {
  name: string;
  iso2: string;
  lastUpdated: string;
  predicted: ICovidOverview[];
  history: ICovidOverview[];
  accuracy: IPredictionAccuracy;
}

export interface ICovidGeneral {
  infected: number;
  recovered: number;
  dead: number;
  sick: number;
  vaccinated: number;
  lastUpdated: Date | string;
}
