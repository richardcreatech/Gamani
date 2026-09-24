import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./router/authRoute.js";
import spotifyRouter from "./router/spotifyRouter.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});
app.use("/api/auth", authRouter);
app.use("/", spotifyRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
