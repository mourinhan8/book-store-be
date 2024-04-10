require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerTail = require("./swagger.json");
const swaggerConfigInit = {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "Books API document",
    description: "bookstores backend"
  },
  host: `${process.env.BACKEND_HOST}`,
  basePath: "/api/v1",
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "x-auth-token",
      scheme: "",
      in: "header"
    }
  },
  tags: [
    {
      name: "users",
      description: "API for users"
    },
    {
      name: "books",
      description: "API for book"
    },
    {
      name: "purchases",
      description: "API for purchase"
    }
  ],
  schemes: [
    "http",
    "https"
  ],
  consumes: [
    "application/json",
    "multipart/form-data"
  ],
  produces: ["application/json"]
};
var options = {
  swaggerOptions: {
    authAction: { JWT: { name: "JWT", schema: { type: "apiKey", in: "header", name: "Authorization", description: "" }, value: "Bearer <JWT>" } }
  }
};
const swaggerDocument = {
  ...swaggerConfigInit,
  ...swaggerTail
};
// Connection check with db
connectDB();
app.use(
  cors({
    origin: '*',
  })
);
// Body parser middleware
app.use(express.json({ extended: false }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.get("/", (req, res) => res.send("API running"));
const BASE_URL = "/api/v1";
// Define Routes
app.use(`${BASE_URL}/users`, require("./routes/api/users"));
app.use(`${BASE_URL}/books`, require("./routes/api/books"));
app.use(`${BASE_URL}/purchases`, require("./routes/api/purchases"));

const PORT = process.env.PORT || 4040;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app; // only for testing
