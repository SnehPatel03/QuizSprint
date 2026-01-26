import { json, registry, z } from "zod";
import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import type { Response, Request } from "express";
import generateTokenAndSaveInCookies from "../jwt/token";

const userSchema = z.object({
  name: z
    .string()
    .min(3, { message: "fullname must contain 3 to 20 characters" })
    .max(20, { message: "fullname must contain 3 to 20 characters" }),

  password: z
    .string()
    .min(8, { message: "Password must contain atleast 8 character" }),
});
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, name, role, password } = req.body || {};

    if (!email || !name || !password) {
      return res.status(400).json({ message: "Enter all credentials" });
    }

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Choose a valid role" });
    }

    const validate = userSchema.safeParse({ email, name, password });
    if (!validate.success) {
      const errorMessage = validate.error.issues.map((err) => err.message);
      return res.status(400).json({ error: errorMessage });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashedPassword,
      },
    });

    const token = generateTokenAndSaveInCookies(user, res);
    return res.status(201).json({
      message: "Signup successful",
      role: user.role,
      name: user.name,
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in signup" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ message: "User not registered" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid Password" });
  }

  const token = generateTokenAndSaveInCookies(user, res);

  res.json({
    message: "Login successful",
    role: user.role,
    name: user.name,
    user,
    token,
  });
};

export const logout = async (req: any, res: any) => {
  return res.status(200).json({
    message: "Logged out successfully",
  });
};
//Handled on frontend Side
