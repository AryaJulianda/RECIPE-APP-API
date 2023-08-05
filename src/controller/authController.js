// controllers/authController.js
const jwt = require('jsonwebtoken');
const config = require('../config/token');
const authModel = require('../model/authModel')
const pool = require('../config/db');
// const { v4: uuidv4 } = require('uuid'); 

exports.login = async (req, res) => {
  let { email, password ,role} = req.body;

  try {
    if(!email) throw new Error('email is required');
    if(!password) throw new Error('password is required')
    if(!role) role = 'user';
    // Find data user
    const user = await authModel.login(email, password);

    // Generate Token JWT
    const accessToken = jwt.sign({ id: user.user_id ,role: role}, config.secretKey, { expiresIn: config.expiresIn });

    // // Generate UUID for session
    // const sessionId = uuidv4();

    // // Save UUID and JWT token in your session storage (e.g., database or cache)
    // // Here, I am using a simple in-memory object to store the sessions
    // sessionsDB[sessionId] = accessToken;

    // res.json({ message: 'Token JWT disimpan di session dengan UUID.', sessionId: sessionId });

    // res.cookie('jwt', accessToken, { httpOnly: true, secure: true })
    res.json({ message: 'Token Jwt.', accessToken: accessToken });

  
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body)
    try {
      // Lakukan registrasi ke database menggunakan model
      const newUser = await authModel.register(username, email, password);
  
      res.json({ success: true, message: 'Registrasi berhasil', user: newUser });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

exports.refreshToken = async (req,res) => {
  try{
    const {id} = req.params;
    const result = await pool.query('SELECT * FROM refresh_tokens WHERE user_id = $1', [id])
    const user = result.rows[0];

    jwt.verify(user.token, config.secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      const payload = decoded;
      // Jika refresh token valid, buat access token baru dan kirimkan kembali ke klien
      const token = jwt.sign({id:payload.id,role:payload.role}, config.secretKey, { expiresIn: config.expiresIn });
      res.cookie('jwt', token, { httpOnly: true, secure: true })
        .json({message:'refresh token is successfully', newToken: token })
    })
  } catch(err) {
    res.json({message:err.message})
  }
}