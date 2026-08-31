export interface NdrrmaNamedRef {
  id: number;
  title: string | null;
  title_ne: string | null;
}

export interface RescuedPerson {
  id: number;
  name: string | null;
  name_ne: string | null;
  age: number | null;
  rescued_location: (NdrrmaNamedRef & { centroid: unknown }) | null;
  stationed_location: (NdrrmaNamedRef & { centroid: unknown }) | null;
  status: NdrrmaNamedRef | null;
  rescued_date: string | null;
  nationality: string | null;
  country: string | null;
  gender: string | null;
  remarks: string | null;
}

export interface RescuedPersonsPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: RescuedPerson[];
}
