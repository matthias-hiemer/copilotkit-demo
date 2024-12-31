export interface PropertyAddress {
  zipCode: string;
  city: string;
  country: string;
  street: string;
  houseNumber: string;
  street2?: string;
}

export interface PropertyObject {
  title: string;
  managementType: 'WEG' | string;
  description?: string;
  numberOfUnits: number;
  propertyId?: string;
  address: PropertyAddress;
}

export interface Cell {
  value: string;
}

export type SpreadsheetRow = Cell[];

export interface SpreadsheetData {
  title: string;
  rows: SpreadsheetRow[];
}
