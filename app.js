const express = require("express");
const path = require("path");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const swaggerDocument = require("./common/swagger");
const passport = require("./common/config/passport");
const rateLimit = require("express-rate-limit");
const config = require("./common/config/configuration");
const initApp = require("./common/init");
const upload = require("express-fileupload");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Express App
const app = express();
app.disable("x-powered-by");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));

// app.get('/', (req, res, next) => res.render('index', { swagger: '/docs' }));

// to configure env host localhost and production ip
swaggerDocument.host = config.hostname;
const options = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "The Project Api Docs",
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.use(
  upload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    limits: {
      fileSize: 1000000, //1mb
    },
    abortOnLimit: true,
  })
);

// Parse application/json
app.use(express.json({ limit: "50mb" }));

// Used to enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
// Protect against HTTP Parameter Pollution attacks
app.use(hpp());
// Sanitize data
app.use(mongoSanitize());
// Set security headers
app.use(helmet());
app.use(
  helmet.hsts({
    maxAge: 6 * 30 * 24 * 60 * 60,
    includeSubDomains: true,
    force: true,
  })
);
// Prevent XSS attack
app.use(xss());
// Rate limiter to all requests
app.use(limiter);

app.use(
  morgan(
    '>>> [:date][ :remote-addr :remote-user][":method :url HTTP/:http-version"][":referrer" ":user-agent"]',
    {
      immediate: true,
    }
  )
);
app.use(
  morgan(
    '<<< [:date][ :remote-addr :remote-user][":method :url HTTP/:http-version"][":referrer" ":user-agent"][":res[content-length] - :status - :response-time ms"]',
    {
      immediate: false,
    }
  )
);

app.use(passport.initialize());

// Initialize app
initApp(app);

app.get("/", (req, res) => {
  res.send("The Project Backend Server");
});

app.listen(config.port, () => {
  console.log(`backend is up & running on port ${config.port}`);
});
