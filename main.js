import express from "express";
import { router } from "./Politicians.js";

let app = express();

app.use(express.json());

app.use("/", router);

let PORT = 1234;
app.listen(PORT, () => {
  console.log(`Congress REST API is running on port ${PORT}`);
});
