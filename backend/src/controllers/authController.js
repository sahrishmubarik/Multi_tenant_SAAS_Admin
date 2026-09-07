import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetUserPassword,
  requestEmailVerification,
  verifyUserEmail,
  getProfile,
  changeUserPassword,
} from "#services/authService.js";
import {
  signupValidation,
  loginValidation,
  changePasswordValidation,
} from "#validators/authValidation.js";

/* SIGNUP */
export async function signup(req, res) {
  await registerUser(signupValidation.parse(req.body));
  res.status(201).json({ message: "Signup successful" });
}

/* LOGIN */
export async function login(req, res) {
  const { token } = await loginUser(loginValidation.parse(req.body));
  res.status(200).json({ message: "Login successful", token });
}

/* FORGOT PASSWORD */
export async function forgetPassword(req, res) {
  await requestPasswordReset(req.body.email);
  res.status(200).json({ message: "Password reset token sent to your email." });
}

/* RESET PASSWORD */
export async function resetPassword(req, res) {
  await resetUserPassword({
    token: req.query.token,
    newPassword: req.body.new_password,
    confirmPassword: req.body.confirm_password,
  });
  res.status(200).json({ message: "Password has been successfully updated!" });
}

/* SEND EMAIL VERIFICATION */
export async function emailVerification(req, res) {
  await requestEmailVerification(req.body.email);
  res.status(200).json({ message: "Verification token sent to your email." });
}

/* VERIFY EMAIL */
export async function verifyEmail(req, res) {
  await verifyUserEmail(req.query.token);
  res
    .status(200)
    .json({ success: true, message: "Email verified successfully." });
}

/* PROFILE */
export async function profileController(req, res) {
  const user = await getProfile(req.user.id);
  res.status(200).json({ user });
}

/* CHANGE PASSWORD */
export async function changePassword(req, res) {
  const { old_password, new_password, confirm_password } = req.body;

  // Validate the new password (throws ZodError -> central error handler).
  changePasswordValidation.parse({
    password: new_password,
    confirmPassword: confirm_password,
  });

  await changeUserPassword(req.user.id, {
    oldPassword: old_password,
    newPassword: new_password,
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully!",
  });
}
