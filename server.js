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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://careopd-frontend.vercel.app",
  "https://careopd-frontend-51k3ja705-niteshkjaiswal108-svgs-projects.vercel.app",
  "https://careopd-frontend-mk77k4ho9-niteshkjaiswal108-svgs-projects.vercel.app",
  "https://care-opd-admin-723u.vercel.app"
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error("Not allowed by CORS"))
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

// 🔥 THIS LINE IS MANDATORY
app.options("*", cors())


// --- API ENDPOINTS ---
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
  res.send('API WORKING Great')
})

// Start server
app.listen(port, () => console.log('Server Started', port))
