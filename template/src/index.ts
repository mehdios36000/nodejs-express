import "express-async-errors";
import { envs } from "@config/vars";
import { errorHandler } from "@middlewares/error";
import router from "@routes/index";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

const app = express();

// Middleware
const corsOptions = {
	origin: envs.corsOrigins?.split(","),
};
app.use(express.json());
app.use(morgan("dev"));
app.use(cors(corsOptions));

// API Documentation
if (process.env.NODE_ENV === "development") {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	// Swagger JSON endpoint
	app.get("/api-docs.json", (req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(swaggerSpec);
	});
}

// Routes
app.use("/api", router);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	if (process.env.NODE_ENV === "development") {
		console.log(
			`API Documentation available at http://localhost:${PORT}/api-docs`,
		);
	}
});
