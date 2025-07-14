import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import connectDb from './config/db.js';
import houseRoute from './routes/house.js'
import photoUploadRoute from './routes/photo-upload.js'
import renderTestRoute from './routes/test.js'
import userRoute from './routes/user.js'
import adminRoute from './routes/admin.js'

import './utils/refetch-call.js'


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
app.use('/api/render',renderTestRoute)
app.use('/api/admin',adminRoute)
app.use('/api/user',userRoute)



app.listen(process.env.PORT, () => {
    console.log(`Server listening on port http://localhost:${process.env.PORT}`);
})