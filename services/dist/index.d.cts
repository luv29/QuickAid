export * from '@prisma/client';
import * as axios from 'axios';

declare class AuthService {
    private api;
    constructor(baseURL: string);
    createToken(phone: string, authorizerType?: AuthorizerType, expiresIn?: string): Promise<axios.AxiosResponse<any, any>>;
    verifyToken(token: string): Promise<axios.AxiosResponse<any, any>>;
}

declare enum AuthorizerType {
    USER = 0,
    MECHANIC = 1
}

export { AuthService, AuthorizerType };
