const { authenticate, validateBody } = require("../../middlewares");

const ctrl = require("../../controllers/contacts");

const express = require("express");

const { schemas } = require("../../models/contacts");

const router = express.Router();

router.get("/", authenticate, ctrl.listContacts);

router.get("/:contactId", authenticate, ctrl.getContactById);

router.post(
  "/",
  authenticate,
  validateBody(schemas.addSchema),
  ctrl.addContact
);

router.delete("/:contactId", authenticate, ctrl.removeContact);

router.put(
  "/:contactId",
  authenticate,
  validateBody(schemas.updateSchema),
  ctrl.updateContact
);

router.patch(
  "/:contactId",
  authenticate,
  validateBody(schemas.updateFavorite),
  ctrl.updateStatusContact
);

module.exports = router;
