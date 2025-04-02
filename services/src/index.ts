export * from "@prisma/client";

import { AuthService } from "./services/auth.services.js";

export enum AuthorizerType {
  USER,
  MECHANIC,
}

export { AuthService };
