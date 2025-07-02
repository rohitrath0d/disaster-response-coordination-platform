import bcrypt from 'bcryptjs';
import { supabase } from '../supabase/client.js';
import jwt from 'jsonwebtoken';
import validator from 'validator';

// Helper function for error responses
const errorResponse = (res, status, message) => {
  console.error(`[Auth Error] ${status}: ${message}`);
  return res.status(status).json({ success: false, message });
};

// REGISTER
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Enhanced validation
    if (!username || !email || !password) {
      return errorResponse(res, 400, "All fields are required");
    }

    if (!validator.isEmail(email)) {
      return errorResponse(res, 400, "Invalid email format");
    }

    if (password.length < 8) {
      return errorResponse(res, 400, "Password must be at least 8 characters");
    }

    // Check for existing user
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') { // Ignore 'no rows found' error
      throw lookupError;
    }

    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'username';
      return errorResponse(res, 409, `${conflictField} already in use`);
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        password_hash: hashedPassword,
        role: 'user'
      }])
      .select()
      .single();

    if (createError) throw createError;

    // Generate token
    const token = jwt.sign(
      { id: user.id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Registration Error:', err);
    return errorResponse(res, 500, "Registration failed. Please try again.");
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    // Find user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    return errorResponse(res, 500, "Login failed. Please try again.");
  }
};