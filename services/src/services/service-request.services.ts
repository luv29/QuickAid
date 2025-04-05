import { AxiosInstance } from "axios";
import { api } from "../api.js";
import { Prisma } from "../index.js";

interface QueryParams {
  page?: number;
  limit?: number;
  where?: Prisma.ServiceRequestWhereInput;
  select?: Prisma.ServiceRequestSelect;
  include?: Prisma.ServiceRequestInclude;
}

export class ServiceRequestService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async create(data: Prisma.ServiceRequestCreateInput) {
    return await this.api.post("api/service-requests", data);
  }

  async findMany(params?: QueryParams) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.where) queryParams.set("where", JSON.stringify(params.where));
    if (params?.select)
      queryParams.set("select", JSON.stringify(params.select));
    if (params?.include)
      queryParams.set("include", JSON.stringify(params.include));

    return await this.api.get(`api/service-requests?${queryParams.toString()}`);
  }

  async findOne(
    id: string,
    include?: Prisma.ServiceRequestInclude,
    select?: Prisma.ServiceRequestSelect
  ) {
    const queryParams = new URLSearchParams();
    if (include) queryParams.set("include", JSON.stringify(include));
    if (select) queryParams.set("select", JSON.stringify(select));

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return await this.api.get(`api/service-requests/${id}${query}`);
  }

  async update(id: string, data: Prisma.ServiceRequestUpdateInput) {
    return await this.api.patch(`api/service-requests/${id}`, data);
  }

  async remove(id: string) {
    return await this.api.delete(`api/service-requests/${id}`);
  }
}
