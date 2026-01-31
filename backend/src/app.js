import express from "express";
import cors from "cors";
import routes from "./routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors(
    {
        origin: ["http://localhost:3000", "http://localhost:3001", "https://swapees-kitchen.vercel.app"],
    }
));
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
    res.send("Swapees Kitchen API running");
});

app.use(errorMiddleware);

export default app;
