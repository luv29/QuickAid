import { Prisma } from '@prisma/client';
export * from '@prisma/client';
import * as axios from 'axios';

declare class AuthService {
    private api;
    constructor(baseURL: string);
    createToken(phone: string, authorizerType?: AuthorizerType, expiresIn?: string): Promise<axios.AxiosResponse<any, any>>;
    verifyToken(token: string): Promise<axios.AxiosResponse<any, any>>;
}

declare class MessagesService {
    private api;
    constructor(baseURL: string);
    getOTP(phone: string): Promise<axios.AxiosResponse<any, any>>;
    verifyOTP(phone: string, otp: string): Promise<axios.AxiosResponse<any, any>>;
}

interface QueryParams$1 {
    page?: number;
    limit?: number;
    where?: Prisma.UserWhereInput;
    select?: Prisma.UserSelect;
    include?: Prisma.UserInclude;
}
declare class UserService {
    private api;
    constructor(baseURL: string);
    create(data: Prisma.UserCreateInput): Promise<axios.AxiosResponse<any, any>>;
    findMany(params?: QueryParams$1): Promise<axios.AxiosResponse<any, any>>;
    findOne(id: string): Promise<axios.AxiosResponse<any, any>>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<axios.AxiosResponse<any, any>>;
    remove(id: string): Promise<axios.AxiosResponse<any, any>>;
}

interface QueryParams {
    page?: number;
    limit?: number;
    where?: Prisma.MechanicWhereInput;
    select?: Prisma.MechanicSelect;
    include?: Prisma.MechanicInclude;
}
declare class MechanicService {
    private api;
    constructor(baseURL: string);
    create(data: Prisma.MechanicCreateInput): Promise<axios.AxiosResponse<any, any>>;
    findMany(params?: QueryParams): Promise<axios.AxiosResponse<any, any>>;
    findOne(id: string, include?: Prisma.MechanicInclude, select?: Prisma.MechanicSelect): Promise<axios.AxiosResponse<any, any>>;
    update(id: string, data: Prisma.MechanicUpdateInput): Promise<axios.AxiosResponse<any, any>>;
    remove(id: string): Promise<axios.AxiosResponse<any, any>>;
}

declare enum AuthorizerType {
    USER = 0,
    MECHANIC = 1
}

export { AuthService, AuthorizerType, MechanicService, MessagesService, UserService };
