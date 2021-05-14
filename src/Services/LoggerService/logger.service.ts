export interface ILoggerService {
    log(...data: unknown[]): void;
}

export class LoggerService {
    private readonly transport = console;

    public log(...data: unknown[]): void {
        this.transport.log(...data);
    }
}