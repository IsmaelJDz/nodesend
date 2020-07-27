const mongoose = require('mongoose');
require('dotenv').config({
  path: 'var.env'
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log('DB connect!');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
