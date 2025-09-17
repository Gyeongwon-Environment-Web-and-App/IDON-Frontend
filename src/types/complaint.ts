// New API Response Types
export interface User {
  name: string;
  serial_no: string;
  phone_no: string;
}

export interface Address {
  address: string;
  region_nm: string;
}

export interface Source {
  phone_no: string;
  bad: boolean;
}

export interface Driver {
  id: number;
  name: string;
  phone_no: string;
}

export interface Team {
  id: number;
  category: string;
  team_nm: string;
  drivers: Driver[];
}

export interface ComplaintExtended {
  id: number;
  datetime: string;
  content: string;
  status: boolean;
  category: string;
  type: string;
  route: string;
  bad: boolean;
  user: User;
  address: Address;
  source: Source;
  teams: Team[];
}

export interface ComplaintApiResponse {
  message: string;
  complaints_extended: ComplaintExtended[];
}

// Form Data Interface (for creating new complaints)
export interface ComplaintFormData {
  address: string;
  datetime: string;
  categories: string[];
  type: string;
  content: string;
  route: string;
  source: {
    phone_no: string;
    bad: boolean;
  };
  notify: {
    usernames: string[];
  };
  // Keep these for UI purposes (not sent to backend)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

// Main Complaint interface
export interface Complaint {
  id: number;
  address: string;
  datetime: string;
  category: string;
  type: string;
  content: string;
  route: string;
  source: {
    phone_no: string;
    bad: boolean;
  };
  notify: {
    usernames: string[];
  };
  // Keep these for UI purposes (not sent to backend)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  // Fields from API response
  status: boolean;
  user: User;
  teams: Team[];
}
