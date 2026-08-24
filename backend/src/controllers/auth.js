import { db } from "#config/client.js";
import { users } from "#drizzle/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  signupValidation,
  loginValidation,
} from "#validators/authValidation.js";
import { createAuditLog } from "#controllers/auditLogs.js";
import { generateAndSendToken } from "#services/emailService.js";
/* SIGNUP SYSTEM */
export async function signup(req, res) {
  // const { username, email, password, confirm_password } = req.body;

  /* Validate fields */
  // if (!username || !email || !password || !confirm_password) {
  //     return res.status(400).json({ message: "All fields are required" });
  // }
  // if (password !== confirm_password) {
  //     return res.status(400).json({ message: "Passwords do not match" });
  // }

  // const validation = signupValidation.safeParse(req.body);
  // if (!validation.success) {
  //     return res.status(400).json({
  //         success: false,
  //         errors: validation.error.errors.map(err => ({
  //             field: err.path[0],
  //             message: err.message
  //         }))
  //     });
  // }

  /* throw error in valid form  */
  const validation = signupValidation.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { name, email, password } = validation.data;

  try {
    const emailExists = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (emailExists.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    /* Hashed password store in database */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* insert data in database */
    const [newUser] = await db
      .insert(users)
      .values({
        name: name,
        email: email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
      });
    /* activity history  */
    const auditResult = await createAuditLog({
      performedBy: newUser.id,
      action: "Create Account",
      affectedUser: newUser.id,
      message:`${newUser.name} created account successfully.`
    });
    // Send verification email
    await generateAndSendToken(newUser.email, "EMAIL_VERIFICATION");

    /* successful request confirmation */
    return res.status(201).json({ message: "Signup successful" ,
      audit:auditResult
    });
  } catch (error) {
    console.log("Signup Error :", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

/* LOGIN SYSTEM */
// export async function login(req, res) {

// const { email, password } = req.body;

/* validate fields */
// if (!email || !password) {
//     return res.status(400).json({ message: "All fields are required" });
// }

// const validation = loginValidation.safeParse(req.body);
// if (!validation.success) {
//     return res.status(400).json({
//         success: false,
//         errors: validation.error.errors.map(err => ({
//             field: err.path[0],
//             message: err.message
//         }))
//     });
// }

//}

export async function login(req, res) {
  const validation = loginValidation.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { email, password } = validation.data;

  try {
    // 1. Find user from database using email
    const user = await db.select().from(users).where(eq(users.email, email));

    if (user.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, user[0].password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email and password",
      });
    }

    // 3. Get user information from database
    const userId = user[0].id;
    const userEmail = user[0].email;

    // 4. Create JWT payload
    const payload = {
      id: userId,
      email: userEmail,
    };

    // 5. Generate JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "72h",
    });

    // 6. Send token to client
    return res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
