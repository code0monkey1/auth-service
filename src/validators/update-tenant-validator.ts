import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        optional: { options: { nullable: true } },
        trim: true,
    },
    address: {
        optional: { options: { nullable: true } },
        trim: true,
    },
});
