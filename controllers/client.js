const { connection, mysql } = require("../connect");
const bcrypt = require("bcrypt");

// get client by email
const getClientByEmail = async (email) => {
  try {
    const client = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM client WHERE email = ?;";
      connection.query(query, [email], (err, results) => {
        if (err) reject(new Error(err.message));
        resolve(results);
      });
    });
    return client.length === 0 ? null : client[0];
  } catch (error) {
    throw error;
  }
};

// get client by id
const getClientById = async (id) => {
  try {
    const client = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM client WHERE id = ?;";
      connection.query(query, [id], (err, results) => {
        if (err) reject(new Error(err.message));
        resolve(results);
      });
    });
    return client.length === 0 ? null : client[0];
  } catch (error) {
    throw error;
  }
};

// insert client
const insertNewClient = async (client) => {
  try {
    const { name, email, password } = client;
    const hashedPassword = await bcrypt.hash(password, 10);
    const dateAdded = Date.now();
    const query =
      "INSERT INTO client (name, email, password, created) VALUES (?,?,?,?);";
    return await new Promise((resolve, reject) => {
      connection.query(
        query,
        [name, email, hashedPassword, dateAdded],
        (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

// update password
const updatePassword = async (id, password) => {
  try {
    const query = "UPDATE client SET password = ? WHERE id = ?;";
    const hashedPassword = await bcrypt.hash(password, 10);
    return await new Promise((resolve, reject) => {
      connection.query(query, [hashedPassword, id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// get all products by their type
const getAllProductsBy = async (name, category, company, price, order) => {
  try {
    switch (order) {
      case "price-lowest":
        order = "total ASC";
        break;
      case "price-highest":
        order = "total DESC";
        break;
      case "name-a":
        order = "product.name ASC";
        break;
      case "name-z":
        order = "product.name DESC";
        break;
      default:
        order = "";
    }
    return await new Promise((resolve, reject) => {
      const query = `SELECT product.id, product.name AS product_name, qty, image_list, description, price, product.price - product.price * discount.percent AS total, discount.id AS discount_id, discount.name AS discount_name, discount.percent AS discount, category.name AS category_name, company.name AS company_name, viewed, color_list, bought, created, status, SKU, image_link FROM product INNER JOIN category ON product.category_id = category.id INNER JOIN company ON product.company_id = company.id INNER JOIN discount ON product.discount = discount.id WHERE product.qty > 0 AND product.price <= ${price} ${
        name && `AND product.name LIKE '${name}%'`
      } ${category && `AND product.category_id = ${category}`} ${
        company && `AND product.company_id = ${company}`
      } ${order && `ORDER BY ${order}`};`;
      connection.query(query, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// get max price product
const getMaxPrice = async () => {
  try {
    return await new Promise((resolve, reject) => {
      const query = "SELECT MAX(price) AS max FROM product WHERE qty > 0;";
      connection.query(query, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result[0]);
      });
    });
  } catch (error) {
    throw error;
  }
};

// get newest products
const getNewProducts = async () => {
  try {
    return await new Promise((resolve, reject) => {
      const query =
        "SELECT product.id, product.name AS product_name, qty, image_list, description, price, discount.id AS discount_id, discount.name AS discount_name, discount.percent AS discount, category.name AS category_name, company.name AS company_name, viewed, color_list, bought, created, status, SKU, image_link FROM product INNER JOIN category ON product.category_id = category.id INNER JOIN company ON product.company_id = company.id INNER JOIN discount ON product.discount = discount.id WHERE product.qty > 0 ORDER BY product.created DESC LIMIT 3;";
      connection.query(query, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// get specific product
const getProductById = async (id) => {
  try {
    return await new Promise((resolve, reject) => {
      const query =
        "SELECT product.id, product.name AS product_name, qty, image_list, description, price, discount.id AS discount_id, discount.name AS discount_name, discount.percent AS discount, category.id AS category_id, category.name AS category_name, company.id AS company_id, company.name AS company_name, viewed, color_list, bought, created, status, SKU, image_link FROM product INNER JOIN category ON product.category_id = category.id INNER JOIN company ON product.company_id = company.id INNER JOIN discount ON product.discount = discount.id WHERE product.id = ?;";
      connection.query(query, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result[0]);
      });
    });
  } catch (error) {
    throw error;
  }
};

// update view count
const increateViewCount = async (id) => {
  try {
    return await new Promise((resolve, reject) => {
      const query = "UPDATE product SET viewed = viewed + 1 WHERE id = ?;";
      connection.query(query, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// insert new transaction
const insertNewTransaction = async (
  payment,
  details,
  id,
  phone,
  address,
  message
) => {
  const query = `INSERT INTO transaction(client_id, client_phone, client_address, message, amount, payment, created, paypal_transaction_id) VALUES(?,?,?,?,?,?,?,?);`;
  try {
    const { create_time, id: transaction_id, purchase_units } = details;
    const {
      amount: { value },
    } = purchase_units[0];
    return await new Promise((resolve, reject) => {
      connection.query(
        query,
        [
          id,
          phone,
          address,
          message,
          value,
          payment,
          create_time,
          transaction_id,
        ],
        (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

// insert ordered items
const insertOrderedItems = async (cart, transaction_id) => {
  try {
    const query =
      "INSERT INTO ordered(transaction_id, product_id, qty, amount, color) VALUES ?;";
    const records = cart.map((cartItem) => {
      const { id, amount, price, color } = cartItem;
      return [transaction_id, id, amount, price, color];
    });
    return await new Promise((resolve, reject) => {
      connection.query(query, [records], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// update products
const updateProducts = async (cart) => {
  try {
    let queries = "";
    cart.forEach(
      (cartItem) =>
        (queries += `UPDATE product SET qty = qty - ${cartItem.amount} WHERE id = ${cartItem.id};`)
    );
    return await new Promise((resolve, reject) => {
      connection.query(queries, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getClientByEmail,
  getClientById,
  insertNewClient,
  updatePassword,
  getMaxPrice,
  getNewProducts,
  getAllProductsBy,
  getProductById,
  increateViewCount,
  insertNewTransaction,
  insertOrderedItems,
  updateProducts,
};
