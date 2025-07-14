const request = require('supertest');
const app = require('../app'); // Asumsi app.js mengekspor aplikasi Express Anda
const { User } = require('../db/models');
const emailService = require('../services/email.service');
const jwt = require('jsonwebtoken');

// Mock semua dependensi eksternal
jest.mock('../db/models');
jest.mock('../services/email.service');
jest.mock('jsonwebtoken');

describe('Auth Endpoints: /api/v1/auth', () => {
  // Reset semua mock sebelum setiap tes
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Tes untuk Register ---
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user, send OTP, and return success message', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const mockUserInstance = { save: jest.fn().mockResolvedValue(true) };
      User.create.mockResolvedValue(mockUserInstance);
      emailService.sendOtpEmail.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('Verifikasi OTP berhasil terkirim ke email anda');
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: userData.email }));
      expect(emailService.sendOtpEmail).toHaveBeenCalled();
    });

    it('should return 400 if email is already registered', async () => {
      User.create.mockRejectedValue({ name: 'SequelizeUniqueConstraintError' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Email sudah terdaftar.');
    });
  });

  // --- Tes untuk Verify OTP ---
  describe('POST /api/v1/auth/verify-otp', () => {
    it('should verify the user if OTP is valid and not expired', async () => {
      const mockUser = {
        verification_code: '123456',
        verification_code_expires_at: new Date(Date.now() + 5 * 60 * 1000), // Belum kedaluwarsa
        is_verified: false,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ email: 'test@example.com', otp: '123456' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('berhasil diverifikasi');
      expect(mockUser.is_verified).toBe(true);
    });

    it('should return 400 if OTP is invalid or expired', async () => {
      User.findOne.mockResolvedValue(null); // Skenario OTP salah

      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ email: 'test@example.com', otp: 'wrong-otp' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('OTP tidak valid');
    });
  });

  // --- Tes untuk Login ---
  describe('POST /api/v1/auth/login', () => {
    it('should return a token for a verified user with correct credentials', async () => {
      const mockUser = {
        id: 'user-id-123',
        password: 'hashed_password',
        is_verified: true,
      };
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('fake-jwt-token');

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('token', 'fake-jwt-token');
    });

    it('should return 403 if user is not verified', async () => {
      const mockUser = {
        password: 'hashed_password',
        is_verified: false, // User belum terverifikasi
      };
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toContain('belum diverifikasi');
    });
  });
  
  // --- Tes untuk Forgot & Reset Password ---
  describe('POST /api/v1/auth/forgot-password & /api/v1/auth/reset-password', () => {
    it('should successfully send OTP for forgot password', async () => {
      const mockUser = { save: jest.fn().mockResolvedValue(true) };
      User.findOne.mockResolvedValue(mockUser);
      emailService.sendOtpEmail.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('menerima kode OTP');
    });

    it('should successfully reset password with a valid OTP', async () => {
        const mockUser = {
            verification_code: '654321',
            verification_code_expires_at: new Date(Date.now() + 5 * 60 * 1000),
            save: jest.fn().mockResolvedValue(true),
        };
        User.findOne.mockResolvedValue(mockUser);
        const bcrypt = require('bcryptjs');
        bcrypt.hash = jest.fn().mockResolvedValue('new_hashed_password');

        const res = await request(app)
            .post('/api/v1/auth/reset-password')
            .send({ email: 'test@example.com', otp: '654321', newPassword: 'newPassword123' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('berhasil direset');
    });
  });
});
