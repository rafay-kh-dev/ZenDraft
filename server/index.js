const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // We created this schema earlier

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { sub: googleId, name, email } = ticket.getPayload();

    // Check if the author already exists in your database
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create a new author if this is their first time logging in
      user = await User.create({
        googleId,
        displayName: name,
        email,
      });
    }

    // Generate a secure JWT session token for your app
    const sessionToken = jwt.sign(
      { userId: user._id }, 
      'super_secret_jwt_key_change_me_later', // We will put this in .env later
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: 'Authentication successful', token: sessionToken, user });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ message: 'Invalid Google Token' });
  }
});