const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
var options = {
  swaggerOptions: {
    authAction :{ JWT: {name: "JWT", schema: {type: "apiKey", in: "header", name: "Authorization", description: ""}, value: "Bearer <JWT>"} }
  }
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app; // only for testing
