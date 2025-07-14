const { User, OTP } = require('../db/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require('crypto');
const emailService = require('../services/email.service');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res) => {    
  try {
    const { name, email, password, phone_number } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required',
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone_number,
      role: 'user'
    });

    const otp = generateOtp();
    const newOTP = await OTP.create({
       user_id: newUser.id,
      verification_code : otp,
      verification_code_expires_at : new Date(Date.now() + 1 * 60 * 1000),
    });
    await newUser.save();
    await newOTP.save();

    await emailService.sendOtpEmail(email, 'Verify Your Account', otp);

     res.status(201).json({
      status: 'success',
      message: 'An OTP has been sent to your email for verification',
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already registered',
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });
    const user_otp = await OTP.findOne({ where: { user_id: user.id } });

    if (!user || user_otp.verification_code !== otp || user_otp.verification_code_expires_at < new Date()) {
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP' });
    }

    user.is_verified = true;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Email successfully verified' });
  } catch (error) {

    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    const user_otp = await OTP.findOne({ where: { user_id: user.id } });

    if (user && !user.is_verified) {
      const otp = generateOtp();
      user_otp.verification_code = otp;
      user_otp.verification_code_expires_at = new Date(Date.now() + 1 * 60 * 1000);
      await user_otp.save();
        await emailService.sendOtpEmail(email, 'Your New OTP Code', otp);
    }
    res.status(200).json({ status: 'success', message: 'If your email is registered, you will receive a new OTP code' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    const user_otp = await OTP.findOne({ where: { user_id: user.id } });

    if (user) {
      const otp = generateOtp();
      user_otp.verification_code = otp;
      user_otp.verification_code_expires_at = new Date(Date.now() + 10 * 60 * 1000);
      await user_otp.save();
      await emailService.sendOtpEmail(email, 'Reset Password Anda', otp);
    }else{
      return res.status(404).json({ status: 'fail', message: 'Email is not found' });
    }

    res.status(200).json({ status: 'success', message: 'If your email is registered, you will receive an OTP' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });
    const user_otp = await OTP.findOne({ where: { user_id: user.id } });

    if (!user || user_otp.verification_code !== otp || user_otp.verification_code_expires_at < new Date()) {
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({ status: 'success', message: 'Password has been reset. Please login' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }


    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({ status: 'fail', message: 'Your account has not been verified. Please check your email' });
    }


    const token = generateToken(user.id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token,
      },
    });
  } catch (error) {
    
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

