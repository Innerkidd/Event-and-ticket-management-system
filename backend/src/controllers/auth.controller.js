const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};
    const user = await authService.register({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user },
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    console.error('Registration failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const result = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    console.error('Login failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

async function googleLogin(req, res) {
  try {
    const { credential } = req.body || {};
    const result = await authService.googleLogin({ credential });

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: result,
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    console.error('Google login failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
};