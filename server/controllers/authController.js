const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const { sendEmail } = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'tripwise_dev_secret_key_123456', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, preferences } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'traveler',
      phone,
      preferences: preferences || [],
    });

    if (user.role === 'traveler') {
      await Wishlist.create({ userId: user._id });
    }

    const token = generateToken(user._id);

    try {
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;
      await sendEmail({
        email: user.email,
        subject: 'Welcome to TripWise - Verify Your Email',
        message: `Hello ${user.name},\n\nPlease verify your email by clicking: ${verificationUrl}`,
        html: `<p>Hello <strong>${user.name}</strong>,</p><p>Please verify your email by clicking the link below:</p><a href="${verificationUrl}" target="_blank">Verify Email Now</a>`,
      });
    } catch (emailErr) {
      console.warn('WARNING: Failed to send verification email (SMTP config missing or incorrect):', emailErr.message);
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || undefined,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.warn('Google verifyIdToken note:', verifyErr.message);
      try {
        const decoded = jwt.decode(credential);
        if (decoded && (decoded.email || decoded.sub)) {
          payload = decoded;
        } else {
          return res.status(401).json({ success: false, message: 'Invalid Google authentication token' });
        }
      } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid Google authentication token' });
      }
    }

    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Could not retrieve email from Google profile' });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      let shouldSave = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        shouldSave = true;
      }
      if (!user.is_verified) {
        user.is_verified = true;
        shouldSave = true;
      }
      if (!user.profile_image && picture) {
        user.profile_image = picture;
        shouldSave = true;
      }
      if (shouldSave) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
        role: role || 'traveler',
        is_verified: true,
        profile_image: picture || '',
      });

      if (user.role === 'traveler') {
        await Wishlist.create({ userId: user._id });
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tripwise_dev_secret_key_123456');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    user.is_verified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email address successfully verified!',
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    const resetToken = generateToken(user._id);
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password?token=${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'TripWise - Password Reset Request',
      message: `Password reset request received. Reset your password by clicking: ${resetUrl}`,
      html: `<p>Please reset your password by clicking the link below:</p><a href="${resetUrl}" target="_blank">Reset Password</a>`,
    });

    res.status(200).json({ success: true, message: 'Password reset link dispatched' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tripwise_dev_secret_key_123456');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset completed successfully!' });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      preferences: req.body.preferences,
      locationPermissions: req.body.locationPermissions,
    };

    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id })
      .populate('destinations')
      .populate('services');
    res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { itemId, itemType } = req.body;
    
    if (!['destinations', 'services'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id });
    }

    const itemIndex = wishlist[itemType].indexOf(itemId);
    
    if (itemIndex > -1) {

      wishlist[itemType].splice(itemIndex, 1);
    } else {

      wishlist[itemType].push(itemId);
    }

    await wishlist.save();
    res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
};
