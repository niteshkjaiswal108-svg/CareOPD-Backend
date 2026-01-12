import jwt from 'jsonwebtoken'

// Doctor authentication middleware

const authDoctor = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const dtoken = authHeader.split(' ')[1]
    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET)

    req.docId = decoded.id; // 👈 this MUST exist
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export default authDoctor
