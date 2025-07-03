import mongoose from "mongoose";
mongoose.set('strictQuery',false)
const connectDb = async () => {
    try {
      const connect = await mongoose.connect(process.env.DBURL);
      console.log(`database connected to ${connect.connection.host}`);
    } catch (error) {
      console.log(`Error : ${error.message}`);
      process.exit;
    }
  };
export default connectDb;