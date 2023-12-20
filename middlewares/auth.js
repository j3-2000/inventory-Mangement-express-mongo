import User from '../models/model.js';

export const auth = async (req, res, next) => {
  try {

    const userData = req.userData
    console.log(userData)
    const user = await User.findById(userData.user_id).populate('roles');

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed admin not found' });
    }
    if (user.roles.name === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access forbidden :- You are not Admin !! Only Admin can acces this routes !!' });
    }
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(401).json({ message: 'Authentication failed. Token invalid. or expired ' });
  }
};

