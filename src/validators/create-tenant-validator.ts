import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        errorMessage: "name is missing",
        notEmpty: true,
        trim: true,
    },
    address: {
        errorMessage: "address is missing",
        notEmpty: true,
        trim: true,
    },
});
