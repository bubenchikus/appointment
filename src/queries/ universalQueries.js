const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const removePasswordHashFromData = (user) => {
  const { passwordHash, ...userData } = user;
  return userData;
};

const signToken = (userId, accountType, expires = "30d") => {
  return jwt.sign(
    {
      userId: userId,
      accountType: accountType,
    },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: expires,
    }
  );
};

const decodeToken = (authHeader) => {
  return jwt.verify(
    (authHeader || "").replace(/Bearer\s?/, ""),
    process.env.JWT_TOKEN_SECRET
  );
};

const getAccountType = (Model) => {
  return Model.collection.collectionName === "doctor" ? "doctor" : "patient";
};

const createUser = async (Model, userData) => {
  const salt = await bcrypt.genSalt(8);
  const passwordHash = await bcrypt.hash(userData.password, salt);

  const user = await new Model({
    ...userData,
    passwordHash: passwordHash,
  }).save();

  const token = signToken(user._id, getAccountType(Model));

  return { ...removePasswordHashFromData(user._doc), token: token };
};

const login = async (Model, userData) => {
  const user = await Model.findOne({ email: userData.email });
  if (!user) {
    return null;
  }

  const isValidPass = await bcrypt.compare(
    userData.password,
    user.passwordHash
  );
  if (!isValidPass) {
    return null;
  }

  const token = signToken(user._id, getAccountType(Model));

  return {
    ...removePasswordHashFromData(user._doc),
    token,
  };
};

const getMe = async (Model, authHeader) => {
  const found = await Model.findById(decodeToken(authHeader).userId);
  if (!found) {
    return null;
  }
  res.json(found);
};

exports.createUser = createUser;
exports.login = login;
exports.getMe = getMe;
