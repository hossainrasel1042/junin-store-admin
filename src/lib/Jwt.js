import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key';

export const generateToken = (user) => {
  const payload = user.dataValues ?? user; 
  return jwt.sign(
    { id: payload.id, role: payload.role, permissions: payload.permissions },
    SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};