import { HttpStatus } from "http-status-ts";

type APIErrorType = {
  message: string;
  status?: number;
};
export default class APIError extends Error {
  public status: any;
  public additionnalInfo: any;

  constructor({
    message,
    status = HttpStatus.INTERNAL_SERVER_ERROR,
  }: APIErrorType) {
    super(message);
    this.status = status;
    this.additionnalInfo = message;
  }
}
