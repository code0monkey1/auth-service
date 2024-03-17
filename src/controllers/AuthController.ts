import { Request, Response } from "express";
type TUser = {
    username: string;
    name: string;
    password: string;
};
export class AuthController {
    register = async (req: Request, res: Response) => {
        const body = (await req.body) as TUser;

        res.status(201).json(body);
    };
}
