export interface Driver {
  name: string;
  phoneNum: string;
  category: string;
  teamNum: string;
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface VehicleDriver {
  name: string;
  phoneNum: string;
  category: string;
  teamNum: string;
}

export interface VehicleFormData {
  vehicleType: string;
  vehicleNum: string;
  ton: string;
  vehicleYear: string;
  vehicleCategory: string;
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  drivers: VehicleDriver[];
  vehicleArea: [];
  broken: boolean;
}
