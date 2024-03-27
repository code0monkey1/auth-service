import { NextFunction, Request, Response } from "express";
import { TenantData, TenantService } from "../services/tenant-service";
import { Logger } from "winston";
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
}
