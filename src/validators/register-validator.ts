import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "email is missing",
        notEmpty: true,
    },
});
