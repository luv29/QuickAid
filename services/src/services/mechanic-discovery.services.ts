import { AxiosInstance } from "axios";
import { api } from "../api.js";
import { ServiceType } from "../index.js";

interface QueryParams {
  latitude: number;
  longitude: number;
  serviceType: ServiceType;
  maxDistance?: number;
  limit?: number;
}

export class MechanicDiscoveryService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async findNearbyMechanics(params: QueryParams) {
    const queryParams = new URLSearchParams();
    queryParams.set("latitude", params.latitude.toString());
    queryParams.set("longitude", params.longitude.toString());
    queryParams.set("serviceType", params.serviceType);
    if (params.maxDistance) queryParams.set("maxDistance", params.maxDistance.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());

    return await this.api.get(`api/mechanic-discovery/nearby?${queryParams.toString()}`);
  }
}
