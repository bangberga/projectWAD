require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 5000;
const app = express();
const cors = require("cors");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const isValidPassword = require("./validator");
const sendMail = require("./sendEmail");
const jwt = require("jsonwebtoken");
const paypal = require("@paypal/checkout-server-sdk");
const Environment = paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(process.env.CLIENT_ID, process.env.CLIENT_SECRET)
);

const {
  getAllNavbars,
  getLogin,
  getLogout,
  getCart,
  getCheckout,
} = require("./controllers/navbar");

const {
  getClientByEmail,
  getClientById,
  insertNewClient,
  updatePassword,
  getAllProductsBy,
  getMaxPrice,
  getNewProducts,
  getProductById,
  increateViewCount,
  insertNewTransaction,
  insertOrderedItems,
  updateProducts,
} = require("./controllers/client");

const {
  findAdmin,
  getAll,
  upload,
  insertNewProduct,
  addNew,
  deleteType,
  updateType,
  checkCart,
  getTransactions,
  getOrders,
  getProducts,
  getNullDiscount,
  getNullDiscountId,
  deleteProduct,
  updateProduct,
} = require("./controllers/admin");

require("./passport-config")(passport, getClientByEmail, getClientById);

app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("views"));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/home", (req, res) => {
  res.redirect("/");
});

const getNavs = async (req, res, next) => {
  try {
    const [links, cart, login, logout, checkout] = await Promise.all([
      getAllNavbars(),
      getCart(),
      getLogin(),
      getLogout(),
      getCheckout(),
    ]);
    if (req.isAuthenticated())
      res.locals.nav = {
        links,
        cart,
        login: null,
        logout,
        checkout,
        user: req.user,
      };
    else res.locals.nav = { links, cart, login, logout: null, checkout: null };
    next();
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
};
const storeThisPage = (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  next();
};
const isAdmin = (req, res, next) => {
  if (!req.session.admin) return res.redirect("/admin/login");
  next();
};

app.use(["/", "/product/"], getNavs);
app.get("/", storeThisPage, (req, res) => {
  res.render("./user/home", { ...res.locals.nav });
});

app.get("/about", storeThisPage, (req, res) => {
  res.render("./user/about", { ...res.locals.nav });
});

app.get("/products", storeThisPage, async (req, res) => {
  try {
    const [categories, companies, max] = await Promise.all([
      getAll("category"),
      getAll("company"),
      getMaxPrice(),
    ]);
    res.render("./user/products", {
      ...res.locals.nav,
      categories,
      companies,
      max,
    });
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// get products by user type
app.post("/getproducts", async (req, res) => {
  try {
    const { name, category, company, price, order } = req.body;
    const products = await getAllProductsBy(
      name,
      category,
      company,
      price,
      order
    );
    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// get max price product
app.get("/getproducts/max", async (req, res) => {
  try {
    res.json({ success: true, data: await getMaxPrice() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// get newest products
app.get("/getproducts/newest", async (req, res) => {
  try {
    res.json({ success: true, data: await getNewProducts() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// get sepecific product page
app.get("/products/:id", storeThisPage, (req, res) => {
  res.render("./user/product", {
    ...res.locals.nav,
  });
});

// filter products by user type
app.post("/getproduct", async (req, res) => {
  const { id } = req.body;
  try {
    const product = await getProductById(id);
    await increateViewCount(id);
    res.json({ product });
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// get cart page
app.get("/cart", storeThisPage, (req, res) => {
  res.render("./user/cart", { ...res.locals.nav });
});

// check the items in database before purchasing
app.post("/checkcart", async (req, res) => {
  const { cart } = req.body;
  const status = await checkCart(cart);
  res.json(status);
});

// get checkout page
app.get("/checkout", storeThisPage, (req, res) => {
  if (req.isUnauthenticated()) return res.redirect("/user/login");
  const paypalClientId = process.env.CLIENT_ID;
  res.render("./user/checkout", { ...res.locals.nav, paypalClientId });
});

// handle checkout button
app.post("/checkout", async (req, res) => {
  const { cart, total } = req.body;
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: total,
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: total,
            },
          },
        },
        items: cart.map((item) => {
          return {
            name: item.name,
            unit_amount: {
              currency_code: "USD",
              value: (item.price - item.price * item.discount).toFixed(2),
            },
            quantity: item.amount,
          };
        }),
      },
    ],
  });
  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// checkout successfully
app.post("/checkout/approve", async (req, res) => {
  try {
    const { payment, details, id, phone, address, message, cart } = req.body;
    const transaction = await insertNewTransaction(
      payment,
      details,
      id,
      phone,
      address,
      message
    );
    const [result, update] = await Promise.all([
      insertOrderedItems(cart, transaction.insertId),
      updateProducts(cart),
    ]);
    res.json({ success: true, result, update });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// send thank you email after purchasing
app.post("/sendthankyou", async (req, res) => {
  try {
    const { email } = req.body;
    await sendMail(email, "Thank you", "Thank you for your payment!");
    res.json({ success: true, message: "The email was sent" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Fail to send the email", error });
  }
});

// get login page
app.get("/user/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");
  res.render("./user/login");
});

// get register page
app.get("/user/register", (req, res) => {
  res.render("./user/register");
});

// register
app.post("/user/register", isValidPassword, async (req, res) => {
  try {
    const { email } = req.body;
    const client = await getClientByEmail(email);
    if (!client) {
      insertNewClient(req.body)
        .then((r) => {
          req.flash("message", "Registered sucessfully!");
          res.redirect("/user/login");
        })
        .catch((e) => {
          req.flash("message", "Something wrong!");
          res.status(500).redirect("/user/register");
        });
    } else {
      req.flash("emailFail", "The client email is exist");
      res.redirect("/user/register");
    }
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// login
app.post(
  "/user/login",
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect(req.session.returnTo || "/");
  }
);

// logout
app.delete("/user/logout", (req, res) => {
  req.logOut();
  res.redirect(req.session.returnTo || "/");
});

// get reset password page
app.get("/user/forgotpassword", (req, res) => {
  res.render("./user/forgotpassword");
});

// reset password
app.post("/user/forgotpassword", async (req, res) => {
  const { emailresetpassword } = req.body;
  const client = await getClientByEmail(emailresetpassword);
  if (!client) {
    req.flash("failMsg", "No user with that email");
    return res.render("./user/forgotpassword");
  }
  const secret = process.env.JWT_SECRET + client.password;
  const payload = { email: client.email, id: client.id };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const linkText = `
  This is the link to reset your password, the link will be closed automatically after 15 minutes or after you reset the password successfully !
  http://localhost:${PORT}/user/resetpassword/${client.id}/${token}`;
  try {
    await sendMail(emailresetpassword, "Reset password", linkText);
    req.flash("successMsg", "Check your email");
    res.render("./user/forgotpassword");
  } catch (error) {
    console.log(error);
    req.flash("failMsg", "Fail to send email");
    res.status(500).render("./user/forgotpassword");
  }
});

// get link to reset password
app.get("/user/resetpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const client = await getClientById(id);
  if (!client) return res.status(400).render("./error/expired");
  const secret = process.env.JWT_SECRET + client.password;
  try {
    const payload = jwt.verify(token, secret);
    res.render("./user/resetpassword", { payload, token });
  } catch (error) {
    res.status(400).render("./error/expired"); // if it is expired
  }
});

// reset password
app.post(
  "/user/resetpassword/:id/:token",
  isValidPassword,
  async (req, res) => {
    const { id, token } = req.params;
    const client = await getClientById(id);
    if (!client) return res.status(400).render("./error/expired");
    const secret = process.env.JWT_SECRET + client.password;
    try {
      const payload = jwt.verify(token, secret);
      await updatePassword(payload.id, req.body.password);
      req.flash("successResetMsg", "Reset password sucessully!");
      res.redirect("/user/login");
    } catch (error) {
      res.status(400).render("./error/expired");
    }
  }
);

app.get("/admin/login", (req, res) => {
  if (req.session.admin) return res.redirect("/admin/addProduct");
  res.render("./admin/login");
});

app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await findAdmin(email, password);
    if (response.success) {
      req.session.admin = email;
      req.flash("successMsg", response.message);
      return res.redirect("/admin/addProduct");
    }
    req.flash("failedMsg", response.message);
    res.redirect(req.url);
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// get page insert new products
app.get("/admin/addProduct", isAdmin, async (req, res) => {
  try {
    const [discounts, categories, companies] = await Promise.all([
      getAll("discount"),
      getAll("category"),
      getAll("company"),
    ]);
    res.render("./admin/form", { discounts, categories, companies });
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// get page insert new category, company, discount
app.get("/admin/addProduct/addNew:type", isAdmin, async (req, res) => {
  const { type } = req.params;
  if (type !== "Discount" && type !== "Category" && type !== "Company")
    return res.status(404).render("./error/error");
  try {
    const data = await getAll(type.toLowerCase());
    res.render("./admin/addnew", { type, data });
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// handle insert new category, company, discount
app.post("/admin/addProduct/addNew:type", async (req, res) => {
  const { type } = req.params;
  try {
    const result = await addNew(type.toLowerCase(), req.body);
    req.flash("successMsg", `New ${type} inserted!`);
    res.redirect(`/admin/addProduct/addNew${type}`);
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// handle update category, company, discount
app.put("/admin/addProduct/update:type", (req, res) => {
  const { type } = req.params;
  const { updatedID, editedName, editedPercent } = req.body;
  updateType(type.toLowerCase(), updatedID, editedName, editedPercent)
    .then((r) => {
      req.flash("editSuccessMsg", `One ${type} was edited!`);
      res.redirect(`/admin/addProduct/addNew${type}`);
    })
    .catch((e) => {
      req.flash("errorMsg", e);
      res.status(500).redirect(`./error/errorserver`);
    });
});

// handle delete company, category, discount
app.delete("/admin/addProduct/delete:type", (req, res) => {
  const { type } = req.params;
  const { deletedID } = req.body;
  console.log(type, deletedID);
  deleteType(type, deletedID)
    .then((r) => {
      req.flash("deleteSuccessMsg", `One ${type} was deleted!`);
      res.redirect(`/admin/addProduct/addNew${type}`);
    })
    .catch((e) => {
      req.flash("errorMsg", e);
      res.status(500).redirect("./error/errorserver");
    });
});

//  handle insert new product
app.post(
  "/admin/addProduct",
  upload.fields([
    { name: "image_link", maxCount: 1 },
    { name: "image_list", maxCount: 4 },
  ]),
  (req, res) => {
    insertNewProduct(req.body, req.files)
      .then((r) => {
        req.flash("successMsg", "New product inserted!");
        res.redirect("/admin/addProduct");
      })
      .catch((e) => {
        req.flash("errorMsg", error);
        res.status(500).render("./error/errorserver");
      });
  }
);

// get transactions page
app.get("/admin/transactions", isAdmin, async (req, res) => {
  try {
    res.render("./admin/transactions", {
      transactions: await getTransactions(),
    });
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// get ordered items list
app.get("/admin/transactions/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { products, max } = await getOrders(id);
    res.render("./admin/order", { products, max });
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// get products page
app.get("/admin/editProducts", isAdmin, async (req, res) => {
  try {
    res.render("./admin/editproducts", {
      products: await getProducts(),
      nullProducts: await getNullDiscount(),
    });
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// get page to edit
app.get("/admin/editProducts/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [discounts, categories, companies, product, nullProducts] =
      await Promise.all([
        getAll("discount"),
        getAll("category"),
        getAll("company"),
        getProductById(id),
        getNullDiscountId(id),
      ]);
    if (product)
      return res.render("./admin/editproduct", {
        discounts,
        categories,
        companies,
        product,
      });
    if (nullProducts)
      return res.render("./admin/editproduct", {
        discounts,
        categories,
        companies,
        product: nullProducts,
      });
    return res.status(404).render("./error/error");
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// update product in stock
app.put(
  "/admin/editProducts/:id",
  upload.fields([
    { name: "image_link", maxCount: 1 },
    { name: "image_list", maxCount: 4 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      await updateProduct(id, req.body, req.files);
      req.flash("successMsg", "Product updated!");
      res.redirect(req.url);
    } catch (error) {
      req.flash("errorMsg", error);
      res.status(500).render("./error/errorserver");
    }
  }
);

// delete product
app.delete("/admin/editProducts/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteProduct(id);
    req.flash("message", response.message);
    res.redirect("/admin/editProducts");
  } catch (error) {
    req.flash("errorMsg", error);
    res.status(500).render("./error/errorserver");
  }
});

// not found pages
app.get("*", (req, res) => {
  res.status(404).render("./error/error");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
