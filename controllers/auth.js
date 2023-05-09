const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const uniqid = require('uniqid'); 

const {BASE_URL} = process.env;

require("dotenv").config();

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const { SECRET_KEY } = process.env;

const { User } = require("../models/users");

const { ctrlWrapper, HttpError, sendEmail } = require("../helpers");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const avatarURL = gravatar.url(email);
  const verificationCode  = uniqid()

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationCode,
  });
  const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click verify email</a>`
    };

  await sendEmail(verifyEmail);
  
  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verifyEmail = async(req, res)=> {
    const {verificationCode} = req.params;
    const user = await User.findOne({verificationCode});
    if(!user){
        throw HttpError(401, "Email not found")
    }
    await User.findByIdAndUpdate(user._id, {verify: true, verificationCode: ""});

    res.json({
        message: "Email verify success"
    })
}

const resendVerifyEmail = async(req, res)=> {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email not found");
    }
    if(user.verify) {
        throw HttpError(401, "Email already verify");
    }

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationCode}">Click verify email</a>`
    };

    await sendEmail(verifyEmail);

    res.json({
        message: "Verify email send success"
    })
}

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "10h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).end();
};

const current = async (req, res) => {
  const { email } = req.user;
  res.json({
    email,
  });
};

const updateAvatar = async (req, res) => {
  const { _id, email } = req.user;
  if (!email) {
    throw HttpError(401, "Not authorized");
  }
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  Jimp.read(resultUpload, (err, res) => {
    if (err) throw err;
    res.resize(250, 250);
  });
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateAvatar: ctrlWrapper(updateAvatar),
  verifyEmail:ctrlWrapper(verifyEmail),
  resendVerifyEmail:ctrlWrapper(resendVerifyEmail),
};
