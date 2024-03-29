import { Request } from "express";
import { RoleType } from "../constants";

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: RoleType;
}

export interface RegisterRequest extends Request {
    body: UserData;
}

export interface CreateUserRequest extends Request {
    body: UserData & { role: RoleType; tenantId: number };
}

export interface AuthRequest extends Request {
    auth: {
        userId: string;
        role: RoleType;
        id: string;
    };
}
