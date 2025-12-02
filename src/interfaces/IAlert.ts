export interface IOptions {
  token: string;
  channelId: string;
}

export interface IContextItem {
  key: string;
  value: string;
}

export interface IBaseAlertOptions {
  text: string;
  serviceName: string;
  payload?: Record<string, unknown> | string;
  mentions?: string[];
}

export interface IErrorOptions extends IBaseAlertOptions {
  stackTrace?: string;
}

export interface ITableOptions extends IBaseAlertOptions {
  title: string;
  headers: string[];
  items: Record<string, unknown>[];
  rowMapper: (item: Record<string, unknown>) => string[];
  alertLevel: "error" | "warning" | "info";
}

export interface IAlert {
  info: (options: IBaseAlertOptions) => Promise<void>;
  warning: (options: IBaseAlertOptions) => Promise<void>;
  error: (options: IErrorOptions) => Promise<void>;
  table: (options: ITableOptions) => Promise<void>;
  addContext: (context: IContextItem | IContextItem[]) => void;
  setOptions: (options: IOptions) => void;
}
