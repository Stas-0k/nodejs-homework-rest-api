const app = require("./app");

const mongoose = require("mongoose");

const DB_HOST =
  "mongodb+srv://brickbybrick15:mVU7NbRkbTCgFbiA@cluster0.il6cy9v.mongodb.net/db-contacts?retryWrites=true&w=majority";

mongoose.set("strictQuery", true);

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

app.listen(3000, () => {
  console.log("Server running. Use our API on port: 3000");
});
