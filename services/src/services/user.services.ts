import { AxiosInstance } from "axios";
import { api } from "../api.js";
import { Prisma } from "../index.js";

interface QueryParams {
  page?: number;
  limit?: number;
  where?: Prisma.UserWhereInput;
  select?: Prisma.UserSelect;
  include?: Prisma.UserInclude;
}

export class UserService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async create(data: Prisma.UserCreateInput) {
    return await this.api.post("api/users", data);
  }

  async findMany(params?: QueryParams) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.where) queryParams.set("where", JSON.stringify(params.where));
    if (params?.select) queryParams.set("select", JSON.stringify(params.select));
    if (params?.include) queryParams.set("include", JSON.stringify(params.include));

    return await this.api.get(`api/users?${queryParams.toString()}`);
  }

  async findOne(id: string) {
    return await this.api.get(`api/users/${id}`);
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await this.api.patch(`api/users/${id}`, data);
  }

  async remove(id: string) {
    return await this.api.delete(`api/users/${id}`);
  }
}
