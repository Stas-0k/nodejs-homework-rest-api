const { Contact } = require("../models/contacts");
const { HttpError, ctrlWrapper } = require("../helpers");

const listContacts = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { favorite = null } = req.query;

  const query = {
    owner,
    favorite,
    };
    
  const isInQuery = (query) => {
    return Object.entries(query).reduce((acc, [key, value]) => {
      if (Boolean(value) === true) {
        const mapping = { [key]: value };
        return Object.assign(acc, mapping);
      }
      return acc;
    }, {});
  };

  const contactsList = await Contact.find(isInQuery(query), "-owner");
  res.json(contactsList);
};

const getContactById = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  const contact = await Contact.findOne({ contactId, owner });
  if (!contact) {
    throw HttpError(404);
  }
  res.json(contact);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const newContact = await Contact.create({ ...req.body, owner });
  res.status(201).json(newContact);
};

const removeContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  const result = await Contact.findOneAndRemove({ contactId, owner });
  if (!result) {
    throw HttpError(404);
  }
  res.json({ message: "contact deleted" });
};

const updateContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  if (!req.body) {
    throw HttpError(400, "missing fields");
  }
  const editedContact = await Contact.findOneAndUpdate(
    { contactId, owner },
    req.body,
    {
      new: true,
    }
  );
  if (!editedContact) {
    throw HttpError(404);
  }
  res.json(editedContact);
};

const updateStatusContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  if (!req.body) {
    throw HttpError(400, "missing field favorite");
  }
  const editedContact = await Contact.findOneAndUpdate(
    { contactId, owner },
    req.body,
    {
      new: true,
    }
  );
  if (!editedContact) {
    throw HttpError(404);
  }
  res.json(editedContact);
};

module.exports = {
  listContacts: ctrlWrapper(listContacts),
  getContactById: ctrlWrapper(getContactById),
  addContact: ctrlWrapper(addContact),
  removeContact: ctrlWrapper(removeContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};