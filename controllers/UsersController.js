var bcrypt = require("bcryptjs");
const UsersModel = require("../models/UsersModel");
const { sendEmail } = require("../utils/mail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ResetPasswordModel = require("../models/ResetPasswordModel");

module.exports.addUser = async (req, res) => {
  try {
    const { name, email, password, phone_no, rating, total_reviews } = req.body;

    const does_email_exist = await UsersModel.findOne({ email });

    if (does_email_exist) {
      return res
        .status(400)
        .json({ error: true, msg: "Sorry! Email Already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await UsersModel.create({
      name,
      email,
      password: hash,
      phone_no,
      rating,
      total_reviews,
    });

    return res.status(200).json({ error: false, msg: "User Added" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};

module.exports.recoverEmail = async (req, res) => {
  try {
    /**
     * Incoming Email
     */

    const { email } = req.params;

    /**
     * ?Check If Email Exists Or Not ------------->
     */
    const does_email_exist = await UsersModel.findOne({ email });

    /**
     * ?Check If Email Exists Or Not ------------->
     */

    if (does_email_exist) {
      /**
       * ?Generate Random Bytes ------------>
       */
      const randomBytes = crypto.randomBytes(50).toString("hex");
      /**
       * !Generate Random Bytes ------------>
       */

      /**
       * ?Generate JWT ------------>
       */
      const token = jwt.sign(
        {
          bytes: randomBytes,
        },
        process.env.JWT_SECRET
      );

      /**
       * !Generate JWT ------------>
       */

      /**
       * ?Check If User Request To Recover Account Already Exist In Collection, If Yes Than Simply Update Token Else Add Request
       */
      const does_user_already_requested = await ResetPasswordModel.findOne({
        email,
      });

      if (does_user_already_requested) {
        const update_token = await ResetPasswordModel.findOneAndUpdate(
          { email },
          {
            token,
          }
        );

        sendEmail(
          email,
          "Reset Password Link",
          `<div>
          Please Visit The <a href="${
            process.env.HOST || "http://localhost:3000"
          }/new_password?email=${email}&token=${token}">Link</a> To Reset Password </div>`
        );

        return res.status(200).json({
          error: false,
          msg: "An Email With Link Has Been Sent To Your Provided Email",
        });
      } else {
        const add_request = await ResetPasswordModel.create({ email, token });
        sendEmail(
          email,
          "Reset Password Link",
          `<div>
          Please Visit The <a href="${
            process.env.HOST || "http://localhost:3000"
          }/new_password?email=${email}&token=${token}">Link</a> To Reset Password </div>`
        );

        return res.status(200).json({
          error: false,
          msg: "Link Has Been Sent To Your Provided Email",
        });
      }
      /**
       * !Check If User Request To Recover Account Already Exist In Collection, If Yes Than Simply Update Token Else Add Request
       */
    }
    return res
      .status(400)
      .json({ error: true, msg: "Sorry! You Are Not Registered With Us" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.resetPassword = async (req, res) => {
  try {
    /**
     * Incoming Token And Email
     */
    const { email, token } = req.params;

    /**
     * Incoming New Password
     */

    const { password } = req.body;

    /**
     * ?Check That Email And Token Does Exist In Reset Passwords Collection------------>
     */

    const does_request_exist = await ResetPasswordModel.findOne({
      email,
      token,
    });

    /**
     * !Check That Email And Token Does Exist In Reset Passwords Collection------------>
     */

    /**
     * ?If Request To Recover Email Exist In Collection Than Update Password Else Return An Error ---------------->
     */

    if (does_request_exist) {
      /**
       * Verify JWT
       */

      const verify_jwt = jwt.verify(
        does_request_exist.token,
        process.env.JWT_SECRET
      );

      if (verify_jwt) {
        /**
         * Hash Password
         */
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        /**
         * Update User Passord
         */
        const is_password_updated = await UsersModel.findOneAndUpdate(
          { email },
          {
            password: hash,
          }
        );

        /**
         * Revoke Token -------------->
         */

        const revoke_token = await ResetPasswordModel.findOneAndDelete({
          email,
          token,
        });

        sendEmail(
          email,
          "Password Changed",
          `<div>Your Password For Real Estate  Has Been Changed Successfully! You Can Now <a href='${
            process.env.HOST || "http://localhost:3000"
          }/login'>Login</a></div>`
        );

        return res
          .status(200)
          .json({ error: false, msg: "Password Has Been Changed" });
      } else {
        return res
          .status(400)
          .json({ error: false, msg: "Something Went Wrong!" });
      }
    }

    /**
     * !If Request To Recover Email Exist In Collection Than Update Password Else Return An Error ---------------->
     */
    return res.status(400).json({ error: true, msg: "Request Doesn't Exist" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.loginUser = async (req, res) => {
  try {
    /**
     * Incoming Email And Password
     */
    const { email, password } = req.body;

    /**
     * Find User Against Email
     */
    let user = await UsersModel.findOne({ email });

    /**
     * @return Return An Error If Password Or Email Is Invalid
     */
    if (!user) {
      return res.status(200).json({ error: true, msg: "Invalid Credentials!" });
    }
    /**
     * Compare Password
     */
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(200).json({ error: true, msg: "Invalid Credentials!" });
    }
    /**
     * Generating JWT And Sending To Request
     */
    const data = {
      user_id: user.id,
    };

    const token = jwt.sign(data, process.env.JWT_SECRET);

    /**
     * @return Return A Token To Request With Logged In User "ID" In Token
     */
    return res.status(200).json({ error: false, token });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    /**
     * Get User ID From "fetchUser" Middleware
     */
    const { user_id } = req;

    /**
     * Find User Profile From Users Collection
     */
    const user_profile = await UsersModel.findById(user_id)
      .select("-password")

    return res.status(200).json(user_profile);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.updateUserProfile = async (req, res) => {
  try {
    /**
     * Incoming Data
     */
    const { name, phone_no, email, password } = req.body;

    /**
     * Get User ID From "fetchUser" Middleware
     */
    const { user_id } = req;

    /**
     * ?Check If The Email Is Requested To Change Or Not By Matching Already Available Email Against User "ID" And Incoming Email
     */
    const is_email_change = await UsersModel.findById(user_id);

    if (is_email_change.email === email) {
      /**
       * ?Update Profile And Don't Change Password If It Is Empty String ------------->
       */
      if (!password) {
        const is_user_updated = await UsersModel.findByIdAndUpdate(user_id, {
          name,
          phone_no,
          email,
        });

        return res.status(200).json({ error: false, msg: "Profile Updated" });
      }
      /**
       * Hash Password
       */
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const is_user_updated = await UsersModel.findByIdAndUpdate(user_id, {
        name,
        phone_no,
        email,
        password: hash,
      });

      /**
       * !Update Profile And Don't Change Password If It Is Empty String ------------->
       */
      return res.status(200).json({ error: false, msg: "Profile Updated" });
    } else {
      /**
       * ?Check If Email Is Already In Database Or Not ------------>
       */

      const does_email_exist = await UsersModel.findOne({ email });

      if (does_email_exist) {
        return res
          .status(400)
          .json({ error: true, msg: "Sorry! Email Already Exists" });
      }

      /**
       * !Check If Email Is Already In Database Or Not ------------>
       */

      /**
       * ?Update Profile And Don't Change Password If It Is Empty String ------------->
       */
      if (!password) {
        const is_user_updated = await UsersModel.findByIdAndUpdate(user_id, {
          name,
          phone_no,
          email,
        });

        return res.status(200).json({ error: false, msg: "Profile Updated" });
      }

      /**
       * Hash Password
       */
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const is_user_updated = await UsersModel.findByIdAndUpdate(user_id, {
        name,
        phone_no,
        email,
        password: hash,
      });

      /**
       * !Update Profile And Don't Change Password If It Is Empty String ------------->
       */
      return res.status(200).json({ error: false, msg: "Profile Updated" });
    }
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};

