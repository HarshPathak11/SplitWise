import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serviceAccount = require("./fairfare-d765b-firebase-adminsdk-fbsvc-2a5854aa2d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
