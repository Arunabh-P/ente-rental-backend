import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import connectDb from './config/db.js';
import houseRoute from './routes/house.js'
import photoUploadRoute from './routes/photo-upload.js'


const app = express()
dotenv.config();
connectDb();

app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cookieParser('SECERT'));
app.use(cors({ origin: true, credentials: true }));

app.use('/api/house', houseRoute);
app.use('/api/upload-photo', photoUploadRoute);


app.listen(process.env.PORT, () => {
    console.log(`Server listening on port http://localhost:${process.env.PORT}`);
})