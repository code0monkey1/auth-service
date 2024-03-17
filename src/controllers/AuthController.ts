import { Response } from "express";
import { RegisterRequest } from "../types";
import { UserService } from "../services/user-services";
import { Logger } from "winston";

export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}

    register = async (req: RegisterRequest, res: Response) => {
        const { firstName, lastName, email, password } = req.body;

        this.logger.info(
            "Request to create user",
            JSON.stringify(req.body, null, 2),
        );

        const user = await this.userService.create({
            firstName,
            lastName,
            email,
            password,
        });

        this.logger.info("User has been registered", { user });

        res.status(201).json();
    };
}
