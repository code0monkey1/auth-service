import { Response } from "express";
// import { AppDataSource } from "../config/data-source";
// import { User } from "../entity/User";
import { RegisterRequest } from "../types";
import { UserService } from "../services/user-servises";

export class AuthController {
    constructor(private readonly userService: UserService) {}
    register = async (req: RegisterRequest, res: Response) => {
        const { firstName, lastName, email, password } = req.body;

        await this.userService.create({
            firstName,
            lastName,
            email,
            password,
        });

        // await userRepository.save({ firstName, lastName, email, password });

        res.status(201).json();
    };
}
