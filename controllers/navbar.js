const { connection } = require("../connect");

// read all navbar links
const getAllNavbars = async () => {
  try {
    return await new Promise((resolve, reject) => {
      const query = "SELECT * FROM catalog WHERE type = ?;";
      connection.query(query, ["navbar"], (err, results) => {
        if (err) reject(new Error(err.message));
        resolve(results);
      });
    });
  } catch (error) {
    throw error;
  }
};

// login link
const getLogin = async () => {
  try {
    return await new Promise((resolve, reject) => {
      const query = "SELECT * FROM catalog WHERE type = ?;";
      connection.query(query, ["login"], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// logout link
const getLogout = async () => {
  try {
    return await new Promise((resolve, reject) => {
      const query = "SELECT * FROM catalog WHERE type = ?;";
      connection.query(query, ["logout"], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// cart link
const getCart = async () => {
  try {
    return await new Promise((resolve, reject) => {
      const query = "SELECT * FROM catalog WHERE type = ?;";
      connection.query(query, ["cart"], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

const getCheckout = async () => {
  try {
    return await new Promise((resolve, reject) => {
      const query = "SELECT * FROM catalog WHERE type = ?;";
      connection.query(query, ["checkout"], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllNavbars,
  getLogin,
  getLogout,
  getCart,
  getCheckout,
};
