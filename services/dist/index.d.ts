import { Prisma, ServiceType } from '@prisma/client';
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

interface QueryParams$3 {
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
    findMany(params?: QueryParams$3): Promise<axios.AxiosResponse<any, any>>;
    findOne(id: string): Promise<axios.AxiosResponse<any, any>>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<axios.AxiosResponse<any, any>>;
    remove(id: string): Promise<axios.AxiosResponse<any, any>>;
}

interface QueryParams$2 {
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
    findMany(params?: QueryParams$2): Promise<axios.AxiosResponse<any, any>>;
    findOne(id: string, include?: Prisma.MechanicInclude, select?: Prisma.MechanicSelect): Promise<axios.AxiosResponse<any, any>>;
    update(id: string, data: Prisma.MechanicUpdateInput): Promise<axios.AxiosResponse<any, any>>;
    remove(id: string): Promise<axios.AxiosResponse<any, any>>;
}

interface QueryParams$1 {
    page?: number;
    limit?: number;
    where?: Prisma.ServiceRequestWhereInput;
    select?: Prisma.ServiceRequestSelect;
    include?: Prisma.ServiceRequestInclude;
}
declare class ServiceRequestService {
    private api;
    constructor(baseURL: string);
    create(data: Prisma.ServiceRequestCreateInput): Promise<axios.AxiosResponse<any, any>>;
    findMany(params?: QueryParams$1): Promise<axios.AxiosResponse<any, any>>;
    findOne(id: string, include?: Prisma.ServiceRequestInclude, select?: Prisma.ServiceRequestSelect): Promise<axios.AxiosResponse<any, any>>;
    update(id: string, data: Prisma.ServiceRequestUpdateInput): Promise<axios.AxiosResponse<any, any>>;
    remove(id: string): Promise<axios.AxiosResponse<any, any>>;
}

interface QueryParams {
    latitude: number;
    longitude: number;
    serviceType: ServiceType;
    maxDistance?: number;
    limit?: number;
}
declare class MechanicDiscoveryService {
    private api;
    constructor(baseURL: string);
    findNearbyMechanics(params: QueryParams): Promise<axios.AxiosResponse<any, any>>;
}

declare class PaymentService {
    private api;
    constructor(baseURL: string);
    createOrder(amount: number, serviceRequestId: string, comment: string): Promise<axios.AxiosResponse<any, any>>;
    verifyPayment(paymentId: string, orderId: string, signature: string): Promise<axios.AxiosResponse<any, any>>;
}

interface MechanicOffer {
    mechanicId: string;
    name: string;
    rating: number;
    distance: number;
    estimatedArrivalTime: number;
}
interface CreateServiceRequestDto {
    userId: string;
    serviceType: ServiceType;
    latitude: number;
    longitude: number;
    description?: string;
    address?: string;
}
declare class BookingService {
    private api;
    constructor(baseURL: string);
    /**
     * Creates a new service request and finds available mechanics
     */
    initiateServiceRequest(createServiceRequestDto: CreateServiceRequestDto): Promise<{
        serviceRequestId: string;
        mechanicOffers: MechanicOffer[];
    }>;
    /**
     * Records a mechanic's response (accept/decline) to a service request
     */
    mechanicRespondsToRequest(mechanicId: string, serviceRequestId: string, isAccepted: boolean): Promise<axios.AxiosResponse<any, any>>;
    /**
     * Gets available mechanics for a specific service request
     */
    getMechanicsForServiceRequest(serviceRequestId: string): Promise<axios.AxiosResponse<any, any>>;
    /**
     * Confirms booking with a specific mechanic
     */
    confirmBookingWithMechanic(userId: string, serviceRequestId: string, mechanicId: string): Promise<axios.AxiosResponse<any, any>>;
}

declare class ReviewsService {
    private api;
    constructor(baseURL: string);
    createReview(reviewData: {
        serviceRequestId: string;
        reviewerType: string;
        rating: number;
        comment?: string;
    }): Promise<axios.AxiosResponse<any, any>>;
    updateReview(reviewId: string, updateData: {
        rating?: number;
        comment?: string;
    }): Promise<axios.AxiosResponse<any, any>>;
    getReviewsByUser(userId: string): Promise<axios.AxiosResponse<any, any>>;
    getReviewsByMechanic(mechanicId: string): Promise<axios.AxiosResponse<any, any>>;
    getReviewsAboutUser(userId: string): Promise<axios.AxiosResponse<any, any>>;
    getReviewsAboutMechanic(mechanicId: string): Promise<axios.AxiosResponse<any, any>>;
    getReviewsByServiceRequest(serviceRequestId: string): Promise<axios.AxiosResponse<any, any>>;
    deleteReview(reviewId: string): Promise<axios.AxiosResponse<any, any>>;
}

declare class SosService {
    private api;
    constructor(baseURL: string);
    createSOS(sosInput: {
        userId: string;
        latitude: number;
        longitude: number;
        customMessage?: string;
        emergencyContact: {
            id?: string;
            name: string;
            mobileNumber: string;
            email?: string;
        };
    }): Promise<axios.AxiosResponse<any, any>>;
}

declare enum AuthorizerType {
    USER = 0,
    MECHANIC = 1
}

export { AuthService, AuthorizerType, BookingService, MechanicDiscoveryService, MechanicService, MessagesService, PaymentService, ReviewsService, ServiceRequestService, SosService, UserService };
