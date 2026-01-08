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
app.use(express.json())

// CORS setup: MUST come before routes
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://careopd-frontend.vercel.app",
  "https://careopd-frontend-51k3ja705-niteshkjaiswal108-svgs-projects.vercel.app",
  "https://careopd-frontend-mk77k4ho9-niteshkjaiswal108-svgs-projects.vercel.app" // your latest deployment
]

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true) // allow Postman / server-to-server
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  credentials: true
}))

// --- API ENDPOINTS ---
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
  res.send('API WORKING Great')
})

// Start server
app.listen(port, () => console.log('Server Started', port))
