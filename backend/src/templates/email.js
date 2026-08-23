export function resetPasswordEmail(token) {
  const resetLink = `http://localhost:5173/api/v1/auth/reset-password?token=${encodeURIComponent(token)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8;">

  <table
    width="100%"
    cellpadding="0"
    style="border-collapse:collapse;"
    border="0"
    style="background-color:#f4f6f8;"
  >
    <tr>
      <td align="center" style="padding:40px 15px;">

        <table
          width="520"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="width:100%; max-width:520px; background-color:#ffffff;"
        >

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px;">

              <h1
                style="
                  margin:0 0 20px;
                  color:#222222;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:26px;
                  line-height:34px;
                  font-weight:700;
                "
              >
                Reset Your Password
              </h1>

              <p
                style="
                  margin:0 0 16px;
                  color:#555555;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:16px;
                  line-height:26px;
                "
              >
                We received a request to reset the password for your account.
              </p>

              <p
                style="
                  margin:0 0 25px;
                  color:#555555;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:16px;
                  line-height:26px;
                "
              >
                Click the button below to continue:
              </p>

              <!-- Button -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#4f46e5"
                    style="border-radius:8px;"
                  >
                    <a
                      href="${resetLink}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:14px 28px;
                        color:#ffffff;
                        background-color:#4f46e5;
                        border-radius:8px;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:16px;
                        line-height:20px;
                        font-weight:700;
                        text-decoration:none;
                      "
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin:30px 0 0;
                  color:#777777;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:14px;
                  line-height:22px;
                "
              >
                This link will expire in <strong>15 minutes</strong>.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="
                padding:20px 35px;
                border-top:1px solid #eeeeee;
                text-align:center;
              "
            >
              <p
                style="
                  margin:0;
                  color:#999999;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:13px;
                  line-height:20px;
                "
              >
                © 2026 Roll Base System
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}


export function verificationEmail(token) {
  console.log(`token`,token)
  const verificationLink =
    `http://localhost:5173/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`;

  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width�vice-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse; background-color:#f4f6f8;">
    <tr>
      <td align="center" style="padding:40px 15px;">

        <table width="520" cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%; max-width:520px; background-color:#ffffff;">
          <tr>
            <td style="padding:40px 35px;">

              <h1 style="margin:0 0 20px; color:#222222; font-family:Arial,Helvetica,sans-serif; font-size:26px; line-height:34px; font-weight:700;">
                Verify Your Email
              </h1>

              <p style="margin:0 0 16px; color:#555555; font-family:Arial,Helvetica,sans-serif; font-size:16px; line-height:26px;">
                Thank you for creating an account with Roll Base System.
              </p>

              <p style="margin:0 0 25px; color:#555555; font-family:Arial,Helvetica,sans-serif; font-size:16px; line-height:26px;">
                Please click the button below to verify your email address:
              </p>

              <table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation">
                <tr>
                  <td align="center" bgcolor="#4f46e5" style="border-radius:8px;">
                    <a href="${verificationLink }" target="_blank" style="display:inline-block; padding:14px 28px; color:#ffffff; background-color:#4f46e5; border-radius:8px; font-family:Arial,Helvetica,sans-serif; font-size:16px; line-height:20px; font-weight:700; text-decoration:none;">
                      VERIFY EMAIL
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:30px 0 0; color:#777777; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:22px;">
                This link will expire in <strong>15 minutes</strong>.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:20px 35px; border-top:1px solid #eeeeee; text-align:center;">
              <p style="margin:0; color:#999999; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:20px;">
                © 2026 Roll Base System
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>

    
  `;
}


// export function verificationEmail(token) {
//   const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${encodeURIComponent(token)}`;

//   return `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Verify Your Email</title>
// </head>

// <body style="margin:0; padding:0; background-color:#f4f6f8;">

//   <table
//     width="100%"
//     cellpadding="0"
//      style="border-collapse:collapse;"
//     border="0"
//     style="background-color:#f4f6f8;"
//   >
//     <tr>
//       <td align="center" style="padding:40px 15px;">

//         <table
//           width="520"
//           cellpadding="0"
//           cellspacing="0"
//           border="0"
//           style="width:100%; max-width:520px; background-color:#ffffff;"
//         >

//           <!-- Content -->
//           <tr>
//             <td style="padding:40px 35px;">

//               <h1
//                 style="
//                   margin:0 0 20px;
//                   color:#222222;
//                   font-family:Arial,Helvetica,sans-serif;
//                   font-size:26px;
//                   line-height:34px;
//                   font-weight:700;
//                 "
//               >
//                 Verify Your Email
//               </h1>

//               <p
//                 style="
//                   margin:0 0 16px;
//                   color:#555555;
//                   font-family:Arial,Helvetica,sans-serif;
//                   font-size:16px;
//                   line-height:26px;
//                 "
//               >
//                 Thank you for creating an account with Roll Base System.
//               </p>

//               <p
//                 style="
//                   margin:0 0 25px;
//                   color:#555555;
//                   font-family:Arial,Helvetica,sans-serif;
//                   font-size:16px;
//                   line-height:26px;
//                 "
//               >
//                 Please click the button below to verify your email address:
//               </p>

//               <!-- Button -->
//               <table
//                 cellpadding="0"
//                 cellspacing="0"
//                 border="0"
//                 align="center"
//               >
//                 <tr>
//                   <td
//                     align="center"
//                     bgcolor="#4f46e5"
//                     style="border-radius:8px;"
//                   >
//                     <a
//                       href="${verificationLink}"
//                       target="_blank"
//                       style="
//                         display:inline-block;
//                         padding:14px 28px;
//                         color:#ffffff;
//                         background-color:#4f46e5;
//                         border-radius:8px;
//                         font-family:Arial,Helvetica,sans-serif;
//                         font-size:16px;
//                         line-height:20px;
//                         font-weight:700;
//                         text-decoration:none;
//                       "
//                     >
//                       VERIFY EMAIL
//                     </a>
//                   </td>
//                 </tr>
//               </table>

//               <p
//                 style="
//                   margin:30px 0 0;
//                   color:#777777;
//                   font-family:Arial,Helvetica,sans-serif;
//                   font-size:14px;
//                   line-height:22px;
//                 "
//               >
//                 This link will expire in <strong>15 minutes</strong>.
//               </p>

//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td
//               style="
//                 padding:20px 35px;
//                 border-top:1px solid #eeeeee;
//                 text-align:center;
//               "
//             >
//               <p
//                 style="
//                   margin:0;
//                   color:#999999;
//                   font-family:Arial,Helvetica,sans-serif;
//                   font-size:13px;
//                   line-height:20px;
//                 "
//               >
//                 © 2026 Roll Base System
//               </p>
//             </td>
//           </tr>

//         </table>

//       </td>
//     </tr>
//   </table>

// </body>
// </html>
//   `;
// }


/* Workspace invitation email */
export function invitationEmail(token, workspaceName) {
  const invitationLink =
      `http://localhost:5173/accept-invitation?token=${encodeURIComponent(token)}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workspace Invitation</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8;">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color:#f4f6f8;"
  >
    <tr>
      <td align="center" style="padding:40px 15px;">

        <table
          width="520"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="width:100%; max-width:520px; background-color:#ffffff;"
        >

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px;">

              <h1
                style="
                  margin:0 0 20px;
                  color:#222222;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:26px;
                  line-height:34px;
                  font-weight:700;
                "
              >
                Workspace Invitation
              </h1>

              <p
                style="
                  margin:0 0 16px;
                  color:#555555;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:16px;
                  line-height:26px;
                "
              >
                You have been invited to join
                <strong>${workspaceName}</strong>.
              </p>

              <p
                style="
                  margin:0 0 25px;
                  color:#555555;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:16px;
                  line-height:26px;
                "
              >
                Click the button below to accept the invitation:
              </p>

              <!-- Button -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#4f46e5"
                    style="border-radius:8px;"
                  >
                    <a
                      href="${invitationLink}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:14px 28px;
                        color:#ffffff;
                        background-color:#4f46e5;
                        border-radius:8px;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:16px;
                        line-height:20px;
                        font-weight:700;
                        text-decoration:none;
                      "
                    >
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin:30px 0 0;
                  color:#777777;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:14px;
                  line-height:22px;
                "
              >
                This invitation will expire in <strong>12 hours</strong>.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="
                padding:20px 35px;
                border-top:1px solid #eeeeee;
                text-align:center;
              "
            >
              <p
                style="
                  margin:0;
                  color:#999999;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:13px;
                  line-height:20px;
                "
              >
                © 2026 Roll Base System
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}