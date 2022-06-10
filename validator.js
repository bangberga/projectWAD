const passwordValidator = require("password-validator");

const schema = new passwordValidator();
schema
  .is()
  .min(8, "Your password should have at least 8 characters") // minimum length is 8
  .has()
  .uppercase(1, "Your password should have at least 1 uppercase letter") // must have uppercase letters
  .has()
  .lowercase(1, "Your password should have at least 1 lowercase letter") // must have lowercase letters
  .has()
  .digits(2, "Your password should have at least 2 digits") // at least 2 digits
  .has()
  .not()
  .spaces(0, "The password must not contain any spaces"); // should not have spaces

const isValidPassword = (req, res, next) => {
  const { email, password, confirm } = req.body;
  if (email !== undefined && email.substr(-10) !== "@gmail.com") {
    req.flash("emailFail", "Your email must endded with gmail.com!");
    return res.redirect(req.url);
  }
  const validations = schema.validate(password, { details: true });
  if (validations.length) {
    let validateMsg = "";
    for (let i = 0; i < validations.length; i++) {
      validateMsg += validations[i]["message"] + ". ";
    }
    req.flash("validation", validateMsg);
    return res.redirect(req.url);
  }
  if (password !== confirm) {
    req.flash("confirmFailure", "The confirm password does not match");
    return res.redirect(req.url);
  }
  next();
};

module.exports = isValidPassword;
