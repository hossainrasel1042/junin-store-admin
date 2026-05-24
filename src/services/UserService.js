import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import supabase from "@/lib/SupabaseConnect";
import { userRepository } from "@/repositories/UserRepo.js";
import {
  createUserSchema,
  updateUserSchema,
} from "@/validations/UserSchema.js";

const BUCKET_NAME = "profile_img";

class ProfileImageUploadService {
  async upload(imageFile) {
    if (!imageFile) return null;

    const fileExt = imageFile.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageFile.buffer, {
        contentType: imageFile.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}

class AddStaff {
  constructor(imageUploadService, repository) {
    this.imageUploadService = imageUploadService;
    this.repository = repository;
  }

  async execute(userData, imageFile = null) {
    let profile_img = await this.imageUploadService.upload(imageFile);

    const payloadToValidate = { ...userData };
    if (profile_img) payloadToValidate.profile_img = profile_img;

    const validatedData = createUserSchema.parse(payloadToValidate);

    const existingUser = await this.repository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(validatedData.password, salt);

    const finalUserData = {
      full_name: validatedData.full_name,
      email: validatedData.email,
      password_hash: password_hash,
      role: validatedData.role,
      phone: validatedData.phone,
      profile_img: validatedData.profile_img,
      permissions: validatedData.permissions,
    };

    return this.repository.create(finalUserData);
  }
}

class UpdateStaff {
  constructor(imageUploadService, repository) {
    this.imageUploadService = imageUploadService;
    this.repository = repository;
  }

  async execute(id, updateData, imageFile = null) {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    let profile_img = await this.imageUploadService.upload(imageFile);

    const payloadToValidate = { ...updateData };
    if (profile_img) payloadToValidate.profile_img = profile_img;

    const validatedData = updateUserSchema.parse(payloadToValidate);
    const finalUpdateData = { ...validatedData };

    if (validatedData.password) {
      const salt = await bcrypt.genSalt(10);
      finalUpdateData.password_hash = await bcrypt.hash(
        validatedData.password,
        salt,
      );
      delete finalUpdateData.password;
    }

    return this.repository.update(id, finalUpdateData);
  }
}

class DeleteStaff {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await this.repository.softDelete(id);
    return { message: "User deleted successfully" };
  }
}

class UserService {
  constructor() {
    const imageUploadService = new ProfileImageUploadService();

    this.addStaff = new AddStaff(imageUploadService, userRepository);
    this.updateStaff = new UpdateStaff(imageUploadService, userRepository);
    this.deleteStaff = new DeleteStaff(userRepository);
  }

  async createUser(userData, imageFile = null) {
    return this.addStaff.execute(userData, imageFile);
  }

  async updateUser(id, updateData, imageFile = null) {
    return this.updateStaff.execute(id, updateData, imageFile);
  }

  async deleteUser(id) {
    return this.deleteStaff.execute(id);
  }

  async getAllUsers() {
    return userRepository.findAll();
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }
}

export const userService = new UserService();
