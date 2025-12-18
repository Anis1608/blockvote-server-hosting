import express from "express"
import { connectDatabase } from "./db.js";
import candidateRoutes from "./routes/candidaterRoutes.js"
import adminRoutes from "./routes/adminRoutes.js";
import castVoteRoutes from "./routes/castVoteRoutes.js";
import resultRoutes from "./routes/resultroutes.js";
import bulkVoterRegisterRoutes from "./routes/fileuploadRoutes/bulkVoterRegisterRoutes.js";
import electionPhaseRoutes from "./routes/electionPhaseRoutes.js";
import logoutRoutes from "./routes/logoutRoutes.js";
import forgotpasswordAdminRoutes from "./routes/forgotpasswordAdminRoutes.js";
import cors from "cors"
import "dotenv/config"
import activityLogRoutes from "./routes/activityLogRoutes.js";
const app = express();
app.use(cors());

app.use(express.json())

// app.use("/voter" , user_routes)
app.use("/api" , candidateRoutes)
app.use("/api" , adminRoutes)
app.use("/api" , castVoteRoutes)
app.use("/api" , resultRoutes)
app.use("/api" , bulkVoterRegisterRoutes)
app.use("/api" , electionPhaseRoutes)
app.use("/api" , logoutRoutes)
app.use("/api" , forgotpasswordAdminRoutes)
app.use("/api" , activityLogRoutes)


app.listen(5000, () =>{
//   database();
  console.log("Server Running on Port 5000")
});
connectDatabase()
