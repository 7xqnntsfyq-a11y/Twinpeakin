import "express-session";
import { User as DbUser } from "../db/schema";

declare global {
  namespace Express {
    interface User extends DbUser {}
    
    interface Request {
      isAuthenticated(): boolean;
      logout(done: (err: any) => void): void;
      login(user: User, done: (err: any) => void): void;
    }
  }
}
