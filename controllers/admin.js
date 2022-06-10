const { connection } = require("../connect");
const multer = require("multer");
const bcrypt = require("bcrypt");

const findAdmin = async (email, password) => {
  try {
    const admin = await new Promise((resolve, reject) => {
      const query = `SELECT * FROM admin WHERE email = ?;`;
      connection.query(query, [email], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result[0]);
      });
    });
    if (!admin) return { success: false, message: "Admin not found" };
    if (await bcrypt.compare(password, admin.password))
      return { success: true, message: "Login successfully!" };
    return { success: false, message: "Wrong password" };
  } catch (error) {
    throw error;
  }
};

// get all types
const getAll = async (type) => {
  try {
    return await new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${type};`;
      connection.query(query, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// use to upload images
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./views/images");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

// insert new product from admin site
const insertNewProduct = async (products, images) => {
  try {
    const {
      name,
      quantity,
      price,
      discount,
      category,
      company,
      colors,
      sku,
      description,
    } = products;
    const { image_link, image_list } = images;
    let imgs = [];
    image_list.forEach((image) => {
      imgs.push(image.filename);
    });
    const dateAdded = Date.now();
    const query =
      "INSERT INTO product(name, qty, image_link, image_list, description, price, discount, category_id, company_id, color_list, created, SKU) VALUES(?,?,?,?,?,?,?,?,?,?,?,?);";
    return await new Promise((resolve, reject) => {
      connection.query(
        query,
        [
          name.trim(),
          quantity,
          image_link[0].filename,
          JSON.stringify(imgs),
          description,
          parseFloat(price),
          discount,
          category,
          company,
          colors,
          dateAdded,
          sku,
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

// update product
const updateProduct = async (id, products, images) => {
  try {
    const {
      name,
      quantity,
      price,
      discount,
      category,
      company,
      colors,
      sku,
      description,
    } = products;
    const { image_link, image_list } = images;
    let imgs = [];
    image_list?.forEach((image) => {
      imgs.push(image.filename);
    });
    let query;
    if (!image_link && !image_list) {
      query = `UPDATE product SET name = '${name}', qty = ${quantity}, description = '${description}', price = ${price}, discount = ${discount}, category_id = ${category}, company_id = ${company}, color_list = '${colors}', SKU = '${sku}' WHERE id = ?;`;
    } else if (!image_link) {
      query = `UPDATE product SET name = '${name}', qty = ${quantity}, image_list = '${JSON.stringify(
        imgs
      )}', description = '${description}', price = ${price}, discount = ${discount}, category_id = ${category}, company_id = ${company}, color_list = '${colors}', SKU = '${sku}' WHERE id = ?;`;
    } else if (!image_list) {
      query = `UPDATE product SET name = '${name}', qty = ${quantity}, image_link = '${image_link[0].filename}', description = '${description}', price = ${price}, discount = ${discount}, category_id = ${category}, company_id = ${company}, color_list = '${colors}', SKU = '${sku}' WHERE id = ?;`;
    } else {
      query = `UPDATE product SET name = '${name}', qty = ${quantity}, image_link = '${
        image_link[0]?.filename
      }', image_list = '${JSON.stringify(
        imgs
      )}', description = '${description}', price = ${price}, discount = ${discount}, category_id = ${category}, company_id = ${company}, color_list = '${colors}', SKU = '${sku}' WHERE id = ?;`;
    }
    return await new Promise((resolve, reject) => {
      connection.query(query, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// insert new company, category, discount
const addNew = async (type, data) => {
  try {
    const { name, percent } = data;
    const query = `INSERT INTO ${type}(name${
      type === "discount" ? ",percent" : ""
    }) VALUES(?${type === "discount" ? ",?" : ""})`;
    return await new Promise((resolve, reject) => {
      connection.query(
        query,
        [name, parseFloat(percent) / 100],
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

// delete company, discount, category
const deleteType = async (type, id) => {
  try {
    const query = `DELETE FROM ${type.toLowerCase()} WHERE id = ?`;
    return await new Promise((resolve, reject) => {
      connection.query(query, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// update company, discount, category
const updateType = async (type, updatedID, editedName, editedPercent) => {
  try {
    if (editedPercent) {
      const query = `UPDATE discount SET name=?, percent=? WHERE id=?;`;
      return await new Promise((resolve, reject) => {
        connection.query(
          query,
          [editedName, parseFloat(editedPercent) / 100, updatedID],
          (err, result) => {
            if (err) reject(new Error(err.message));
            resolve(result);
          }
        );
      });
    }
    const query = `UPDATE ${type} SET name=? WHERE id=?;`;
    return await new Promise((resolve, reject) => {
      connection.query(query, [editedName, updatedID], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

const checkCart = async (cart) => {
  let query = "SELECT id, name, qty, discount FROM product WHERE id IN (";
  for (let i = 0; i < cart.length; i++) {
    query += cart[i]["id"] + ",";
  }
  query = query.slice(0, -1);
  query += ") AND qty > 0;";
  try {
    const foundedItems = await new Promise((resolve, reject) => {
      connection.query(query, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
    const missing = cart.filter(
      (cartItem) => !foundedItems.find((item) => item.id === cartItem.id)
    );
    const notEnoughItems = foundedItems.filter(
      (item) =>
        item.qty < cart.find((cardItem) => cardItem.id === item.id).amount
    );
    if (notEnoughItems.length || missing.length)
      return {
        success: false,
        missing,
        notEnoughItems,
        message: "Ooops! Invalid items in your cart",
      };
    return { success: true, message: "Valid" };
  } catch (error) {
    throw error;
  }
};

const getTransactions = async () => {
  try {
    const query =
      "SELECT transaction.id AS transaction_id, status, client.id AS client_id, client.name AS client_name, client.email AS client_email, client_phone, client_address, message, amount, payment, transaction.created AS transaction_created FROM transaction INNER JOIN client ON transaction.client_id = client.id;";
    return await new Promise((resolve, reject) => {
      connection.query(query, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

const getOrders = async (id) => {
  try {
    const ordered =
      "SELECT transaction_id, ordered.id AS order_id, ordered.product_id, ordered.qty, ordered.amount, transaction.amount AS transaction_total, product.name AS product_name, category.name AS category_name, company.name AS company_name, product.image_link AS image_link FROM ordered INNER JOIN product ON ordered.product_id = product.id INNER JOIN transaction ON transaction_id = transaction.id INNER JOIN category ON product.category_id = category.id INNER JOIN company ON product.company_id = company.id WHERE transaction_id = ?;";
    const products = await new Promise((resolve, reject) => {
      connection.query(ordered, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
    const realAmount =
      "SELECT SUM(ordered.amount * ordered.qty) AS sum FROM ordered INNER JOIN transaction ON transaction_id = transaction.id WHERE transaction_id = ?;";
    const max = await new Promise((resolve, reject) => {
      connection.query(realAmount, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result[0]);
      });
    });
    return { success: true, products, max };
  } catch (error) {
    throw error;
  }
};

const getProducts = async () => {
  try {
    const query =
      "SELECT product.id, product.name AS product_name, qty, image_list, description, price, discount.id AS discount_id, discount.name AS discount_name, discount.percent AS discount, category.id AS category_id, category.name AS category_name, company.id AS company_id, company.name AS company_name, viewed, color_list, bought, created, status, SKU, image_link FROM product INNER JOIN category ON product.category_id = category.id INNER JOIN company ON product.company_id = company.id INNER JOIN discount ON product.discount = discount.id;";
    return await new Promise((resolve, reject) => {
      connection.query(query, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

const getNullDiscount = async () => {
  try {
    const query =
      "SELECT product.id, product.name AS product_name, qty, image_list, description, price, category.name AS category_name, company.name AS company_name, viewed, color_list, bought, created, status, SKU, image_link FROM product INNER JOIN category ON product.category_id = category.id INNER JOIN company ON product.company_id = company.id WHERE product.discount IS NULL;";
    return await new Promise((resolve, reject) => {
      connection.query(query, (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

const getNullDiscountId = async (id) => {
  try {
    const query =
      "SELECT product.id, product.name AS product_name, qty, image_list, description, price, category.name AS category_name, company.name AS company_name, viewed, color_list, bought, created, status, SKU, image_link FROM product INNER JOIN category ON product.category_id = category.id INNER JOIN company ON product.company_id = company.id WHERE product.id = ? AND product.discount IS NULL;";
    return await new Promise((resolve, reject) => {
      connection.query(query, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result[0]);
      });
    });
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    const checkQuery =
      "SELECT ordered.id AS ordered_id, ordered.product_id AS product_id, transaction.status AS transaction_status FROM ordered INNER JOIN transaction ON ordered.transaction_id = transaction.id WHERE ordered.product_id = ? AND transaction.status = 0;";
    const unfulfilled = await new Promise((resolve, reject) => {
      connection.query(checkQuery, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      });
    });
    if (unfulfilled.length)
      return {
        success: false,
        message: "This product is in uncompleted transaction",
      };
    const deleteQuery = "DELETE FROM product WHERE id = ?;";
    return await new Promise((resolve, reject) => {
      connection.query(deleteQuery, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve({
          success: true,
          message: "The product was deleted successfully!",
        });
      });
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findAdmin,
  addNew,
  getAll,
  insertNewProduct,
  deleteType,
  updateType,
  upload,
  checkCart,
  getTransactions,
  getOrders,
  getProducts,
  getNullDiscount,
  getNullDiscountId,
  deleteProduct,
  updateProduct,
};
