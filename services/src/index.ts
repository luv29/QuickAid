export * from "@prisma/client";

import { AuthService } from "./services/auth.services.js";
import { MessagesService } from "./services/messages.services.js";
import { UserService } from "./services/user.services.js";
import { MechanicService } from "./services/mechanic.services.js";

export enum AuthorizerType {
  USER,
  MECHANIC,
}

export { AuthService, MessagesService, UserService, MechanicService };
