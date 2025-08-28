const { sequelize, User, OTP } = require('../db/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { fullname, email, password, phone_number } = req.body;
    console.log('Registering user:', fullname, email);
    if (!fullname || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required',
      });
    }

    const newUser = await User.create({
      name : fullname,
      email,
      password,
      phone_number,
    });

    const otp = generateOtp();
    const newOTP = await OTP.create({
       user_id: newUser.id,
      verification_code : otp,
      expires_at : new Date(Date.now() + 1 * 60 * 1000),
    });
    await newUser.save();
    await newOTP.save();

    // await emailService.sendOtpEmail(email, 'Verify Your Account', otp);
    await t.commit();
     res.status(201).json({
      status: 'success',
      message: 'An OTP has been sent to your email for verification',
    });
  } catch (error) {
    await t.rollback();
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already registered',
      });
    }
    console.error('Error during registration:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      where: { email },
      include: { model: OTP, as: 'otp' },
    });

    if (!user || !user.otp || user.otp.verification_code !== otp || user.otp.expires_at < new Date()) {
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP' });
    }

    user.is_verified = true;
    await user.save({ transaction: t });

    await t.commit();
    return res.status(200).json({ status: 'success', message: 'Email successfully verified' });
  } catch (error) {
    console.error(error.message);
    await t.rollback();
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const user = await User.findOne({
      where: { email },
      include: { model: OTP, as: 'otp' },
    });

    if (!user || user.is_verified) {
      return res.status(200).json({
        status: 'success',
        message: 'If your email is registered and not verified, you will receive a new OTP.',
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (user.otp) {
      user.otp.verification_code = otp;
      user.otp.expires_at = expiresAt;
      await user.otp.save({ transaction: t });
    } else {
      await OTP.create({
        userId: user.id,
        verification_code: otp,
        expires_at: expiresAt,
      }, { transaction: t });
    }

    await emailService.sendOtpEmail(email, 'Your New OTP Code', otp);
    await t.commit();

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email if it is valid and unverified.',
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
      include: { model: OTP, as: 'otp' },
    });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Email is not found' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user.otp) {
      user.otp.verification_code = otp;
      user.otp.expires_at = expiresAt;
      await user.otp.save({ transaction: t });
    } else {
      await OTP.create({
        userId: user.id,
        verification_code: otp,
        expires_at: expiresAt,
      }, { transaction: t });
    }

    await emailService.sendOtpEmail(email, 'Reset Password Anda', otp);
    await t.commit();

    return res.status(200).json({
      status: 'success',
      message: 'OTP for password reset sent to your email.',
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
    const t = await sequelize.transaction();
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ where: { email }, include: {model: OTP, as: 'otp'}  });

    if (!user || user.otp.verification_code !== otp || user.otp.expires_at < new Date()) {
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();
    await t.commit();
    res.status(200).json({ status: 'success', message: 'Password has been reset. Please login' });
  } catch (error) {
    await t.rollback();
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

