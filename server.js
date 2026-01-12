import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

// App config
const app = express()
const port = process.env.PORT || 4000

connectDB()
connectCloudinary()

// --- MIDDLEWARES ---

// Parse JSON
app.use(cors({
  origin: true,
  credentials: true
}))
  
  app.use(express.json());


// --- API ENDPOINTS ---
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
  res.send('API WORKING Great')
})

// Start server
app.listen(port, () => console.log('Server Started', port))
