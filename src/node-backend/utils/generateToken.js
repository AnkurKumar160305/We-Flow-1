import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

  // Set JWT as HTTP-Only cookie (optional depending on frontend preference, we will also return it in json for local storage if preferred)
  // We'll primarily return it in the JSON response as requested by "store token on frontend"
  return token;
};

export default generateToken;
