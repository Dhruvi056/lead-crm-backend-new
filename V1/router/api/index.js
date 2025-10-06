const router = require("express").Router();

router.use("/auth", require("./auth.router"));
router.use("/lead", require("./lead.router"));
router.use("/note", require("./noteRoutes"));
module.exports = router;
