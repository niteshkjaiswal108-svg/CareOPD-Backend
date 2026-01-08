import jwt from 'jsonwebtoken'

const authAdmin = async (req, res, next) => {
  try {
    const atoken = req.headers.atoken

    if (!atoken) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized, Login Again'
      })
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)

    if (
      token_decode !==
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized, Login Again'
      })
    }

    next()
  } catch (error) {
    console.log(error)
    res.status(401).json({
      success: false,
      message: 'Invalid or Expired Token'
    })
  }
}

export default authAdmin
