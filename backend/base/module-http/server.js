import http from "http";
import url from "url";

/**
 * createServer
 * @param {function} handler - function(type, method, body) => void
 */
export function createServer(handler) {
  return {
    start(port = 3000, message = null, callback = null) {
      const server = http.createServer((req, res) => {
        // type = response helper
        const type = {
          json: (data = { status: "OK" }, statusCode = 200) => {
            res.writeHead(statusCode, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
          },
          html: (data = "<h1>OK</h1>", statusCode = 200) => {
            if (typeof data !== "string") data = JSON.stringify(data, null, 2);
            res.writeHead(statusCode, { "Content-Type": "text/html" });
            res.end(data);
          },
          text: (data = "OK", statusCode = 200) => {
            if (typeof data !== "string") data = JSON.stringify(data, null, 2);
            res.writeHead(statusCode, { "Content-Type": "text/plain" });
            res.end(data);
          }
        };

        const method = {
          get: req.method === "GET",
          post: req.method === "POST",
          put: req.method === "PUT",
          patch: req.method === "PATCH",
          delete: req.method === "DELETE",
          head: req.method === "HEAD",
          options: req.method === "OPTIONS",
          method: req.method,
          url: req.url
        };

        let body = [];
        req.on("data", chunk => body.push(chunk));
        req.on("end", () => {
          body = Buffer.concat(body).toString();

          try {
            body = JSON.parse(body);
          } catch {
            // jika bukan JSON biarkan sebagai string
          }

          if (
            method.get ||
            method.post ||
            method.put ||
            method.patch ||
            method.delete ||
            method.head ||
            method.options
          ) {
            if (handler) handler(type, method, body);
            else type.json({ status: "OK" });
          } else {
            type.json({ error: `Method ${method.method} tidak didukung` }, 405);
          }
        });
      });

      server.listen(port, () => {
        const infoMsg = message || `Server running at http://localhost:${port}`;
        console.log(infoMsg);
        if (callback) callback(server);
      });

      return server;
    }
  };
}



// ============================================================
// Tambahan createApp untuk routing + middleware
// ============================================================
export function createApp() {
  const routes = [];
  const middlewares = [];

  function addRoute(method, path, handler) {
    routes.push({ method, path, handler });
  }

  function runMiddlewares(req, res, done) {
    let i = 0;
    function next(err) {
      if (err) {
        res.json({ error: err.message }, 500);
        return;
      }
      if (i < middlewares.length) {
        const mw = middlewares[i++];
        mw(req, res, next);
      } else {
        done();
      }
    }
    next();
  }

  function handler(type, method, body) {
    const parsedUrl = url.parse(method.url, true);
    const route = routes.find(
      r => r.method === method.method && r.path === parsedUrl.pathname
    );

    // inject ke req mirip express
    const req = { ...method, body, query: parsedUrl.query };
    const res = {
      json: type.json,
      html: type.html,
      text: type.text
    };

    runMiddlewares(req, res, () => {
      if (route) {
        route.handler(req, res);
      } else {
        type.json({ error: "Not Found" }, 404);
      }
    });
  }

  const server = createServer(handler);

  return {
    use(fn) {
      middlewares.push(fn);
    },
    get(path, fn) {
      addRoute("GET", path, fn);
    },
    post(path, fn) {
      addRoute("POST", path, fn);
    },
    put(path, fn) {
      addRoute("PUT", path, fn);
    },
    delete(path, fn) {
      addRoute("DELETE", path, fn);
    },
    start: server.start
  };
}
