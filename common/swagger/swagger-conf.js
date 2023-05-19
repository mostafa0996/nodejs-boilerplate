module.exports = {
  swagger: "2.0",
  info: {
    version: "0.0.0",
    title: "The Project",
    description: "API for the The Project",
    contact: {
      name: "The Project Team",
      url: "",
      email: "",
    },
  },
  basePath: "/api/v0",
  tags: [],
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
};
