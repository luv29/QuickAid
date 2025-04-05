// src/index.ts
export * from "@prisma/client";

// src/api.ts
import axios from "axios";
var apiInstance = null;
var api = (baseURL) => {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL,
      timeout: 2e4,
      headers: {
        "Content-Type": "application/json"
      }
    });
    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
      }
    );
  }
  return apiInstance;
};

// src/services/auth.services.ts
var AuthService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async createToken(phone, authorizerType, expiresIn) {
    return await this.api.post(`api/auth/create-token`, {
      phone,
      authorizerType,
      expiresIn
    });
  }
  async verifyToken(token) {
    return await this.api.post(`api/auth/verify-token`, { token });
  }
};

// src/services/messages.services.ts
var MessagesService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async getOTP(phone) {
    const urlParams = new URLSearchParams();
    urlParams.set("phone", phone);
    return await this.api.get(`api/messages/get-otp?${urlParams.toString()}`);
  }
  async verifyOTP(phone, otp) {
    const urlParams = new URLSearchParams();
    urlParams.set("phone", phone);
    urlParams.set("otp", otp);
    return await this.api.get(
      `api/messages/verify-otp?${urlParams.toString()}`
    );
  }
};

// src/services/user.services.ts
var UserService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async create(data) {
    return await this.api.post("api/users", data);
  }
  async findMany(params) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.where) queryParams.set("where", JSON.stringify(params.where));
    if (params?.select) queryParams.set("select", JSON.stringify(params.select));
    if (params?.include) queryParams.set("include", JSON.stringify(params.include));
    return await this.api.get(`api/users?${queryParams.toString()}`);
  }
  async findOne(id) {
    return await this.api.get(`api/users/${id}`);
  }
  async update(id, data) {
    return await this.api.patch(`api/users/${id}`, data);
  }
  async remove(id) {
    return await this.api.delete(`api/users/${id}`);
  }
};

// src/services/mechanic.services.ts
var MechanicService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async create(data) {
    return await this.api.post("api/mechanics", data);
  }
  async findMany(params) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.where) queryParams.set("where", JSON.stringify(params.where));
    if (params?.select) queryParams.set("select", JSON.stringify(params.select));
    if (params?.include) queryParams.set("include", JSON.stringify(params.include));
    return await this.api.get(`api/mechanics?${queryParams.toString()}`);
  }
  async findOne(id, include, select) {
    const queryParams = new URLSearchParams();
    if (include) queryParams.set("include", JSON.stringify(include));
    if (select) queryParams.set("select", JSON.stringify(select));
    return await this.api.get(`api/mechanics/${id}?${queryParams.toString()}`);
  }
  async update(id, data) {
    return await this.api.patch(`api/mechanics/${id}`, data);
  }
  async remove(id) {
    return await this.api.delete(`api/mechanics/${id}`);
  }
};

// src/services/service-request.services.ts
var ServiceRequestService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async create(data) {
    return await this.api.post("api/service-requests", data);
  }
  async findMany(params) {
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
  async findOne(id, include, select) {
    const queryParams = new URLSearchParams();
    if (include) queryParams.set("include", JSON.stringify(include));
    if (select) queryParams.set("select", JSON.stringify(select));
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return await this.api.get(`api/service-requests/${id}${query}`);
  }
  async update(id, data) {
    return await this.api.patch(`api/service-requests/${id}`, data);
  }
  async remove(id) {
    return await this.api.delete(`api/service-requests/${id}`);
  }
};

// src/services/mechanic-discovery.services.ts
var MechanicDiscoveryService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async findNearbyMechanics(params) {
    const queryParams = new URLSearchParams();
    queryParams.set("latitude", params.latitude.toString());
    queryParams.set("longitude", params.longitude.toString());
    queryParams.set("serviceType", params.serviceType);
    if (params.maxDistance) queryParams.set("maxDistance", params.maxDistance.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    return await this.api.get(`api/mechanic-discovery/nearby?${queryParams.toString()}`);
  }
};

// src/services/payment.services.ts
var PaymentService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async createOrder(amount, serviceRequestId, comment) {
    return await this.api.post("api/payments/create", { amount, serviceRequestId, comment });
  }
  async verifyPayment(paymentId, orderId, signature) {
    return await this.api.post("api/payments/verify", { paymentId, orderId, signature });
  }
};

// src/services/booking.services.ts
var BookingService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  /**
   * Creates a new service request and finds available mechanics
   */
  async initiateServiceRequest(createServiceRequestDto) {
    return await this.api.post("api/booking/request", createServiceRequestDto);
  }
  /**
   * Records a mechanic's response (accept/decline) to a service request
   */
  async mechanicRespondsToRequest(mechanicId, serviceRequestId, isAccepted) {
    return await this.api.post("api/booking/mechanic/response", {
      mechanicId,
      serviceRequestId,
      isAccepted
    });
  }
  /**
   * Gets available mechanics for a specific service request
   */
  async getMechanicsForServiceRequest(serviceRequestId) {
    return await this.api.get(`api/booking/request/${serviceRequestId}/mechanics`);
  }
  /**
   * Confirms booking with a specific mechanic
   */
  async confirmBookingWithMechanic(userId, serviceRequestId, mechanicId) {
    return await this.api.post("api/booking/confirm", {
      userId,
      serviceRequestId,
      mechanicId
    });
  }
};

// src/services/reviews.services.ts
var ReviewsService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async createReview(reviewData) {
    return await this.api.post("api/reviews", reviewData);
  }
  async updateReview(reviewId, updateData) {
    return await this.api.put(`api/reviews/update/${reviewId}`, updateData);
  }
  async getReviewsByUser(userId) {
    return await this.api.get(`api/reviews/user/${userId}`);
  }
  async getReviewsByMechanic(mechanicId) {
    return await this.api.get(`api/reviews/mechanic/${mechanicId}`);
  }
  async getReviewsAboutUser(userId) {
    return await this.api.get(`api/reviews/reviews-about-user/${userId}`);
  }
  async getReviewsAboutMechanic(mechanicId) {
    return await this.api.get(`api/reviews/reviews-about-mechanic/${mechanicId}`);
  }
  async getReviewsByServiceRequest(serviceRequestId) {
    return await this.api.get(`api/reviews/service-request/${serviceRequestId}`);
  }
  async deleteReview(reviewId) {
    return await this.api.delete(`api/reviews/delete/${reviewId}`);
  }
};

// src/services/sos.services.ts
var SosService = class {
  constructor(baseURL) {
    this.api = api(baseURL);
  }
  async createSOS(sosInput) {
    return await this.api.post("api/sos", sosInput);
  }
};

// src/index.ts
var AuthorizerType = /* @__PURE__ */ ((AuthorizerType2) => {
  AuthorizerType2[AuthorizerType2["USER"] = 0] = "USER";
  AuthorizerType2[AuthorizerType2["MECHANIC"] = 1] = "MECHANIC";
  return AuthorizerType2;
})(AuthorizerType || {});
export {
  AuthService,
  AuthorizerType,
  BookingService,
  MechanicDiscoveryService,
  MechanicService,
  MessagesService,
  PaymentService,
  ReviewsService,
  ServiceRequestService,
  SosService,
  UserService
};
