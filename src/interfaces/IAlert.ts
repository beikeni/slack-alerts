export type IOptions = {
  token: string;
  channelId: string;
};

export type IContextItem = {
  key: string;
  value: string;
};

export type IBaseAlertOptions = {
  text: string;
  serviceName: string;
  payload?: Record<string, unknown> | string;
  mentions?: string[];
};

export type IErrorOptions = IBaseAlertOptions & {
  stackTrace?: string;
};

export type ITableOptions<T> = IBaseAlertOptions & {
  title: string;
  headers: string[];
  items: T[];
  rowMapper: (item: T) => string[];
  alertLevel?: "error" | "warning" | "info";
};

export interface IAlert {
  info: (options: IBaseAlertOptions) => Promise<void>;
  warning: (options: IBaseAlertOptions) => Promise<void>;
  error: (options: IErrorOptions) => Promise<void>;
  table: <T>(options: ITableOptions<T>) => Promise<void>;
  addContext: (context: IContextItem | IContextItem[]) => void;
  setOptions: (options: IOptions) => void;
}
