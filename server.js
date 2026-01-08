import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

// app config

const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares

app.use(express.json())
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://careopd-frontend.vercel.app",
    "https://careopd-frontend-51k3ja705-niteshkjaiswal108-svgs-projects.vercel.app"
  ]
}))


// api endpoints

app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)


app.get('/', (req, res) => {
    res.send('API WORKING Great')
})

app.listen(port, () => console.log('Server Started', port))