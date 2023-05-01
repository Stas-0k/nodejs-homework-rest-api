const {User} = require("../../models/users")

const express = require("express");
const Joi = require("joi");

const { HttpError } = require("../../helpers");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {SECRET_KEY} = process.env;