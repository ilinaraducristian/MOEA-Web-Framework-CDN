const http = require("http");
const jwt = require("jsonwebtoken");

let RSA_PUBLIC_KEY;
let PEM_CERTIFICATE;

let ROUTES;
let AUTHENTICATION_ISSUER_URL;

module.exports = function (authentication_issuer_url, routes) {
  ROUTES = routes;
  AUTHENTICATION_ISSUER_URL = authentication_issuer_url;
  return handleRequest;
};

async function handleRequest(req, res) {
  if (!pathMatcher(req)) return;
  if (RSA_PUBLIC_KEY == undefined) await getRSAPublicKey();
  let authorization_header = req.headers["authorization"];
  if (authorization_header == undefined || authorization_header == null) {
    res.header("WWW-Authenticate", "Bearer").status(401).send();
    return;
  }
  authorization_header = authorization_header.replace("Bearer ", "");
  try {
    req.jwt = jwt.verify(authorization_header, PEM_CERTIFICATE);
  } catch (error) {
    switch (error.message) {
      case "invalid token":
        res
          .header(
            "WWW-Authenticate",
            `Bearer error="invalid_token", error_description="Invalid token", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"`
          )
          .status(401)
          .send();
        break;
      case "jwt expired":
        res
          .header(
            "WWW-Authenticate",
            `Bearer error="invalid_token", error_description="Jwt expired at ${error.expiredAt.toISOString()}", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"`
          )
          .status(401)
          .send();
        break;
      default:
        console.log(error);
        res.status(500).send();
    }
  }
}

function pathMatcher(req) {
  let validRoute = false;
  for (let route of ROUTES) {
    if (req.url.match(route)) {
      validRoute = true;
      break;
    }
  }
  return validRoute;
}

async function getRSAPublicKey() {
  try {
    RSA_PUBLIC_KEY = JSON.parse(await _getRSAPublicKey());
    PEM_CERTIFICATE = `-----BEGIN CERTIFICATE-----\n${RSA_PUBLIC_KEY.keys[0].x5c[0]}\n-----END CERTIFICATE----- `;
  } catch (error) {
    console.log(error);
    res.status(500).send();
    return res;
  }
  function _getRSAPublicKey() {
    return new Promise((resolve, reject) => {
      let options = {};
      function callback(response) {
        let str = "";

        response.on("data", function (chunk) {
          str += chunk;
        });

        response.on("end", function () {
          resolve(str);
        });
      }
      try {
        http
          .get(
            `${AUTHENTICATION_ISSUER_URL}/protocol/openid-connect/certs`,
            options,
            callback
          )
          .end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
