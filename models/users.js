const { Schema, model } = require("mongoose");
const Joi = require("joi");

const emailRegexp = /^\w+([.-_]?\w+)*@\w+([.-_]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: String,
    avatarURL: {
        type: String,
        required: true,
    }
  },
  { versionKey: false, timestamps: true }
);

const User = model("user", userSchema);

const registerSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().pattern(emailRegexp).required(),
  subscription: Joi.string(),
  token: Joi.string(),
});

const loginSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().pattern(emailRegexp).required(),
});

const updateSubSchema = Joi.object({
  subscription: Joi.string()
    .required(),
});

const schemas = { registerSchema, loginSchema, updateSubSchema };

module.exports = {
  User,
  schemas,
};
