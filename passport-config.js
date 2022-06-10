const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

module.exports = (passport, getClientByEmail, getClientById) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const client = await getClientByEmail(email);
        if (!client) {
          return done(null, false, { message: "Your email is incorrect" });
        }
        try {
          if (await bcrypt.compare(password, client.password)) {
            return done(null, client);
          } else {
            return done(null, false, { message: "Your password is incorrect" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((client, done) => {
    done(null, client.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      return done(null, await getClientById(id));
    } catch (error) {
      done(error);
    }
  });
};
