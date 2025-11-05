const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

require('dotenv').config();

const router = express.Router();

// --- Nodemailer Transporter (no changes) ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
});

transporter.verify((error, success) => {
    if (error) console.error("❌ Nodemailer verification failed:", error);
    else console.log("✅ Nodemailer transporter is ready");
});

// --- Send OTP (no changes) ---
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteOne({ email });
        const newOTP = new OTP({ email, otp: otpCode });
        await newOTP.save();
        const mailOptions = {
            from: `"Carzi" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Carzi Verification Code',
            html: `<p>Your verification code is: <b>${otpCode}</b></p><p>This code is valid for 5 minutes.</p>`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'OTP sent successfully.' });
    } catch (err) {
        console.error("❌ Nodemailer failed:", err);
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
    }
});

// --- Verify OTP (no changes) ---
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        await OTP.deleteOne({ _id: otpRecord._id });
        await User.updateOne({ email }, { $set: { verified: true } });
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } catch (err) {
        console.error("❌ OTP verification failed:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// --- Signup ---
router.post('/signup', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('type').isIn(['customer', 'car-owner']).withMessage('User type is invalid')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, phone, type, aadhaar } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            const message = existingUser.email === email 
                ? 'An account with this email already exists.' 
                : 'An account with this phone number already exists.';
            return res.status(400).json({ success: false, message: message });
        }
        
        const user = new User({ name, email, password, phone, type, aadhaar, verified: type === 'customer' });
        await user.save();

        if (type === 'car-owner') {
             console.log(`New car-owner ${email} registered. Awaiting OTP verification.`);
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({
                success: true,
                message: 'User registered successfully!',
                token,
                // --- UPDATED USER OBJECT ---
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    type: user.type,
                    phone: user.phone,
                    createdAt: user.createdAt
                }
            });
        });
    } catch (err) {
        console.error("❌ Signup Error:", err);
        res.status(500).json({ success: false, message: 'Server error during signup' });
    }
});


// --- Login ---
router.post('/login', [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        if (!user.verified && user.type === 'car-owner') {
            return res.status(401).json({ 
                success: false,
                verificationRequired: true, 
                message: 'Your account is not verified. Please check your email for the OTP.' 
            });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.status(200).json({
                success: true,
                token,
                // --- UPDATED USER OBJECT ---
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    type: user.type,
                    phone: user.phone,
                    createdAt: user.createdAt
                }
            });
        });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});


module.exports = router;

// @route   POST /api/auth/forgot-password
// @desc    Request password reset link
// @access  Public
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User with that email does not exist.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        await user.save();

        // Create reset URL
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `
            You are receiving this email because you (or someone else) has requested the reset of a password.
            Please make a PUT request to: \n\n ${resetUrl}
            This link will expire in 1 hour.
        `;

        try {
            await transporter.sendMail({
                from: `"Carzi" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Reset Request',
                text: message,
                html: `<p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
                       <p>Please click on this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>
                       <p>This link will expire in 1 hour.</p>`
            });

            res.status(200).json({ success: true, message: 'Email sent successfully' });
        } catch (err) {
            console.error("❌ Error sending reset email:", err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }

    } catch (err) {
        console.error("❌ Forgot Password Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset user password
// @access  Public
router.put('/reset-password/:token', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });

    } catch (err) {
        console.error("❌ Reset Password Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});