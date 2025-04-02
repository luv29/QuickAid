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

// src/index.ts
var AuthorizerType = /* @__PURE__ */ ((AuthorizerType2) => {
  AuthorizerType2[AuthorizerType2["USER"] = 0] = "USER";
  AuthorizerType2[AuthorizerType2["MECHANIC"] = 1] = "MECHANIC";
  return AuthorizerType2;
})(AuthorizerType || {});
export {
  AuthService,
  AuthorizerType
};
