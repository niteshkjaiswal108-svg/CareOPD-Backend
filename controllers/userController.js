import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from 'razorpay';

// API to register user

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }
    // Validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a Valid Email" });
    }
    // Validating a strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a Strong Password" });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    // _id

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Does Not Exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data

const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.user.id).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// API to update user profile

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // 🔐 from auth middleware
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !address || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    const parsedAddress =
      typeof address === "string" ? JSON.parse(address) : address;

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(
        imageFile.path,
        { resource_type: "image" }
      );

      await userModel.findByIdAndUpdate(userId, {
        image: imageUpload.secure_url,
      });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment

const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id   // ✅ comes from auth middleware
    const { docId, slotDate, slotTime } = req.body

    if (!docId || !slotDate || !slotTime) {
      return res.json({ success: false, message: 'Missing booking data' })
    }

    // 1️⃣ Get doctor
    const docData = await doctorModel.findById(docId).select('-password')

    if (!docData || !docData.available) {
      return res.json({ success: false, message: 'Doctor not available' })
    }

    // 2️⃣ Slot check
    let slots_booked = docData.slots_booked || {}

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: 'Slot already booked' })
    }

    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = []
    }

    slots_booked[slotDate].push(slotTime)

    // 3️⃣ Get user
    const userData = await userModel.findById(userId).select('-password')

    // 4️⃣ Create appointment object
    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: docData.fees,
      date: Date.now()
    }

    // 5️⃣ Save appointment
    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()

    // 6️⃣ Update doctor slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment booked successfully' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get user appointments for frontend my-appointments page

const listAppointment = async (req, res) => {
  try {
    const userId = req.user.id
    const appointments = await appointmentModel.find({userId})

    res.json({success:true, appointments})
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to cancel appointment

const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;               // from auth middleware
    const { appointmentId } = req.body;       // from frontend

    if (!appointmentId) {
      return res.json({
        success: false,
        message: "Appointment ID is required"
      });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    // 🔴 Check if appointment exists
    if (!appointmentData) {
      return res.json({
        success: false,
        message: "Appointment not found"
      });
    }

    // 🔐 Verify appointment owner
    if (appointmentData.userId.toString() !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized action"
      });
    }

    // ✅ Cancel appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true
    });

    // ✅ Release doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    if (doctorData?.slots_booked?.[slotDate]) {
      doctorData.slots_booked[slotDate] =
        doctorData.slots_booked[slotDate].filter(
          (time) => time !== slotTime
        );

      await doctorModel.findByIdAndUpdate(docId, {
        slots_booked: doctorData.slots_booked
      });
    }

    res.json({
      success: true,
      message: "Appointment cancelled successfully"
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment };