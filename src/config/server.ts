import cors from "cors";
import express from "express";
import "express-async-errors";
import morgan from "morgan";
import router from "@routes/index";
import { errorHandler } from "@middlewares/error";

const app = express();


app.use(cors({ origin: "*" }));
app.disable("etag");
app.use(
  morgan(
    ":date[iso] :remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms"
  )
);

app.use(express.json());
app.use("/api", router);

app.use(errorHandler);

export default app;
