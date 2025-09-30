const { body, validationResult } = require("express-validator");

exports.validateLead = [
    body("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .isAlpha()
        .withMessage("First name must contain only letters"),

    body("email")
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error("Email must be an array");
            }

            if (!value[0] || value[0].trim() === "") {
                throw new Error("Primary email is required");
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value[0])) {
                throw new Error("Primary email must be valid");
            }

            for (let i = 1; i < value.length; i++) {
                if (value[i] && value[i].trim() !== "" && !emailRegex.test(value[i])) {
                    throw new Error(`Secondary email at index ${ i } is invalid`);
                }
            }
            return true;
        }),

    body("websiteURL")
        .optional({ nullable: true, checkFalsy: true })
        .bail()
        .isURL()
        .withMessage("Valid website URL is required"),

    body("linkdinURL")
        .optional({ nullable: true, checkFalsy: true })
        .bail()
        .isURL()
        .withMessage("Valid LinkedIn URL is required"),

    body("industry")
        .notEmpty()
        .withMessage("Industry is required"),

    body("whatsUpNumber")
        .notEmpty()
        .withMessage("WhatsApp number is required")
        .bail()
        .isNumeric()
        .withMessage("WhatsApp number must be numeric"),

    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE"])
        .withMessage("Status must be one of: ACTIVE, INACTIVE"),

    body("workEmail")
        .optional({ nullable: true, checkFalsy: true })
        .bail()
        .isEmail()
        .withMessage("Enter a valid work email"),

    body("priority")
        .optional()
        .isIn(["HIGH", "MEDIUM", "LOW"])
        .withMessage("Priority must be one of: HIGH, MEDIUM, LOW"),

    body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .bail()
        .isMongoId()
        .withMessage("Invalid User ID")
];

exports.handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map((err) => err.msg)
        });
    }
    next();
};
