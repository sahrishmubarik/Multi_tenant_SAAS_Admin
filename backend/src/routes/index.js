import express from "express";

import auth from "./auth.js";
import workspace from "./workspace.js";
import invitation from "./invitation.js";

const router = express.Router();
/* auth endpoints */
router.use("/auth", auth);
/* workspace */
router.use("/workspace", workspace);
/* invitation */

router.use("/workspace-invitation", invitation);

export default router;
