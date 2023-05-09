const express = require("express");

const { validateBody, authenticate, upload } = require("../../middlewares");

const { schemas } = require("../../models/users");

const ctrl = require("../../controllers/auth");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

router.get("/current", authenticate, ctrl.current);

router.patch("/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar)

router.get("/verify/:verificationToken", ctrl.verifyEmail)

router.post("/verify",validateBody(schemas.emailSchema),ctrl.resendVerifyEmail )


module.exports = router;