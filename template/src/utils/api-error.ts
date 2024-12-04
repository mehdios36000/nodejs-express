import { StatusCodes } from "http-status-codes";

type APIErrorType = {
	message: string;
	status?: number;
};
export default class APIError extends Error {
	public status: any;
	public additionnalInfo: any;

	constructor({
		message,
		status = StatusCodes.INTERNAL_SERVER_ERROR,
	}: APIErrorType) {
		super(message);
		this.status = status;
		this.additionnalInfo = message;
	}
}
