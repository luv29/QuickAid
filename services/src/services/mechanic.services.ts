import { AxiosInstance } from "axios";
import { api } from "../api.js";
import { Prisma } from "../index.js";

interface QueryParams {
  page?: number;
  limit?: number;
  where?: Prisma.MechanicWhereInput;
  select?: Prisma.MechanicSelect;
  include?: Prisma.MechanicInclude;
}

export class MechanicService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async create(data: Prisma.MechanicCreateInput) {
    return await this.api.post("api/mechanics", data);
  }

  async findMany(params?: QueryParams) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.where) queryParams.set("where", JSON.stringify(params.where));
    if (params?.select) queryParams.set("select", JSON.stringify(params.select));
    if (params?.include) queryParams.set("include", JSON.stringify(params.include));

    return await this.api.get(`api/mechanics?${queryParams.toString()}`);
  }

  async findOne(id: string, include?: Prisma.MechanicInclude, select?: Prisma.MechanicSelect) {
    const queryParams = new URLSearchParams();
    if (include) queryParams.set("include", JSON.stringify(include));
    if (select) queryParams.set("select", JSON.stringify(select));

    return await this.api.get(`api/mechanics/${id}?${queryParams.toString()}`);
  }

  async update(id: string, data: Prisma.MechanicUpdateInput) {
    return await this.api.patch(`api/mechanics/${id}`, data);
  }

  async remove(id: string) {
    return await this.api.delete(`api/mechanics/${id}`);
  }
}