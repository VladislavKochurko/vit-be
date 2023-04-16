import { IServerError } from '../common/interfaces/common.interfaces';

export class ServerError extends Error {
  private serverStatus: IServerError;

  constructor(error: IServerError) {
    super(error.message);
    this.serverStatus = error;
  }

  public get status(): number {
    return this.serverStatus.status;
  }

  public get message(): string {
    return this.serverStatus.message;
  }
}
