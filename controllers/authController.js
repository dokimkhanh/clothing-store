import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, phone, fullname, address } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Create new user with all provided fields
    user = new User({
      email,
      password: await bcrypt.hash(password, 10),
      phone: phone,
      fullname: fullname,
      address: address
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;

        // Return user data without sensitive information
        const { password, __v, ...userWithoutSensitiveInfo } = user.toObject();

        res.status(201).json({
          message: "Đăng ký thành công",
          token,
          user: userWithoutSensitiveInfo
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({
      $or: [{ email: email }, { phone: email }]
    });

    if (!user) {
      return res.status(400).json({ message: "Thông tin đăng nhập không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Thông tin đăng nhập không đúng" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        const { password, __v, ...userWithoutSensitiveInfo } = user.toObject();
        res.json({
          message: "Đăng nhập thành công",
          token,
          user: userWithoutSensitiveInfo,
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
