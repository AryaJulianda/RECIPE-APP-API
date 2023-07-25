const app = require('express');

const router = app.Router();
const recipe = require('./recipeRouter');
const category = require('./categoryRouter');
const auth = require('./authRouter');
const { tokenVerification,validateRole } = require('../middleware/authMiddleware');

router.use('/admin',tokenVerification, validateRole('admin'));
router.use('/recipe', recipe);
router.use('/category', category);
router.use('/auth',auth)
module.exports = router;
