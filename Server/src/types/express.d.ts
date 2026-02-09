import { User } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user: Pick<User, "id">;
    }
  }
}
