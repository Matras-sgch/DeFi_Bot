import axios from "axios";

export interface IRequestService {
    get<T>(url: string): Promise<T>;
}

export class RequestService implements IRequestService {
    public async get<T>(url: string): Promise<T> {
        return axios.get(url);
    }
}