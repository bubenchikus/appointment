const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const removePasswordHashFromData = (user) => {
  const { passwordHash, ...userData } = user;
  return userData;
};

const signToken = (user, expires = "30d") => {
  return jwt.sign(
    {
      userId: user._id,
      accountType: accountType,
    },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: expires,
    }
  );
};

const createUser = async (Model, userData) => {
  const salt = await bcrypt.genSalt(8);
  const passwordHash = await bcrypt.hash(userData.password, salt);

  const user = await new Model({
    ...userData,
    passwordHash: passwordHash,
  }).save();

  const token = signToken(user);

  return { ...removePasswordHashFromData(user), token: token };
};

const login = async (Model, userData) => {
  const user = await Model.findOne({ email: userData.email }).lean();
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

  const token = signToken(user);

  return {
    ...removePasswordHashFromData(user),
    token,
  };
};

exports.createUser = createUser;
exports.login = login;
