import { NextFunction, Request, Response } from "express";
import { TenantData, TenantService } from "../services/tenant-service";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
interface TenantRequest extends Request {
    body: TenantData;
}
export class TenantController {
    constructor(
        private readonly tenantService: TenantService,
        private readonly logger: Logger,
    ) {}
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = validationResult(req);

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const tenantRequest = req as TenantRequest;

            const tenant = tenantRequest.body;

            const newTenant = await this.tenantService.create(tenant);
            this.logger.info(
                " 🥳 created new tenant with id : " + newTenant.id,
            );

            res.status(201).json({ id: newTenant.id });
        } catch (e) {
            next(e);
        }
    };
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id?.trim();

            if (!id || id === "undefined") {
                const error = createHttpError(
                    400,
                    "Missing id parameter in the request",
                );
                return next(error);
            }

            const tenant = await this.tenantService.findById(Number(id));

            if (!tenant) {
                const error = createHttpError(
                    404,
                    `Tenant with id: ${id} does not exist`,
                );
                return next(error);
            }

            this.logger.info(" 🥳 found tenant with id : " + tenant.id);

            res.status(200).json(tenant);
        } catch (e) {
            next(e);
        }
    };
}
