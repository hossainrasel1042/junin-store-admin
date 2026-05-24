import { userRepository } from '@/repositories/UserRepo.js';
import { generateToken } from '@/lib/Jwt.js';
import bcrypt from 'bcrypt';

class AuthService {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error('Invalid email or password');
    const token = generateToken(user);
    return { token };
  }
}

export const authService = new AuthService();