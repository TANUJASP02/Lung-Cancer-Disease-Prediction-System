export interface DataRow {
  [key: string]: string | number;
}

export interface Dataset {
  name: string;
  data: DataRow[];
  columns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  rowCount: number;
}

export interface ColumnStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  PREDICTION = 'PREDICTION',
  CHAT = 'CHAT'
}
