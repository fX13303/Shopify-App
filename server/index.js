// @ts-check
import { resolve } from "path";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, ApiVersion } from "@shopify/shopify-api";
import "dotenv/config";
import bodyParser from 'body-parser'
import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import {Page} from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js';
import viteReact from "@vitejs/plugin-react";

const USE_ONLINE_TOKENS = true;
const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";

const PORT = parseInt(process.env.PORT || "8081", 10);
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.April22,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/webhooks",
  webhookHandler: async (topic, shop, body) => {
    delete ACTIVE_SHOPIFY_SHOPS[shop];
  },
});

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const app = express();
  app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
  app.set("active-shopify-shops", ACTIVE_SHOPIFY_SHOPS);
  app.set("use-online-tokens", USE_ONLINE_TOKENS);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app);


  app.get('/pages', verifyRequest(app), async (req, res) => {
      
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res);
      // Create a new client for the specified shop.
      const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
      // Use `client.get` to request the specified Shopify REST API endpoint, in this case `products`.
      const pages = await client.get({
        path: 'pages',
      })  
      console.log('page ', pages)
      res.status(200).send(pages)
    }catch(err){
      res.status(500).send(err.message)
    }
  })

  app.post('/newpage', verifyRequest(app), bodyParser.json(), async (req, res) => {
    try {
      const test_session = await Shopify.Utils.loadCurrentSession(req, res);
      const page = new Page({session: test_session});
      page.title = req.body.title;
      page.body_html = req.body.content; 
      await page.save({});
      console.log('page', page)

      res.status(200).send(JSON.stringify(page))
    }
    catch (err) {
      res.status(500).send(err.message)
      console.log(err)
    }
  })

  app.delete('/delpages', verifyRequest(app), bodyParser.json(), async (req, res) => {
    try {
      const test_session = await Shopify.Utils.loadCurrentSession(req, res);
      console.log(req.body) 
      req.body.map(async (pageId) => {
        await Page.delete({
          session: test_session,
          id: pageId,
        });
      })
      res.status(200).send("Delete Success")
    } catch (err) {
      res.status(500).send(err.message)
      console.log(err)
    }
  })

  app.get('/page/:_id', verifyRequest(app), async (req,res) => {
    try {
      const test_session = await Shopify.Utils.loadCurrentSession(req, res);
      const page = await Page.find({
        session: test_session,
        id: req.params._id,
      });
      res.status(200).send(page)
    } catch (err) {
      console.log(err)
      res.status(404).send(err)
    }
  })
  app.put('/pages/:_id', verifyRequest(app),bodyParser.json(), async (req, res) => {
    try {
      const test_session = await Shopify.Utils.loadCurrentSession(req, res);
      const page = new Page({session: test_session});
      page.id = parseInt(req.params._id, 10);
      console.log(req.body)
      page.title = req.body.title;
      page.body_html = req.body.body_html;
      await page.save({});
      res.status(200).send(page)
    } catch(err) {
      res.status(404).send(err)
      console.log(err)
    }
  })

  app.delete('/pages/:_id', verifyRequest(app),bodyParser.json(), async (req, res) => {
    try {
      const test_session = await Shopify.Utils.loadCurrentSession(req, res);
      await Page.delete({
        session: test_session,
        id: parseInt(req.params._id),
      });
      res.status(200).send('Delete Successfully')
    } catch(err) {
      console.log(err)
      res.status(404).send(err)
    }
  })
  app.post("/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
      if (!res.headersSent) {
        res.status(500).send(error.message);
      }
    }
  });

  app.get("/products-count", verifyRequest(app), async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.post("/graphql", verifyRequest(app), async (req, res) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.use(express.json());

  app.use((req, res, next) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${shop} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  app.use("/*", (req, res, next) => {
    const { shop } = req.query;

    // Detect whether we need to reinstall the app, any request from Shopify will
    // include a shop in the query parameters.
    if (app.get("active-shopify-shops")[shop] === undefined && shop) {
      res.redirect(`/auth?${new URLSearchParams(req.query).toString()}`);
    } else {
      next();
    }
  });

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await import("vite").then(({ createServer }) =>
      createServer({
        root,
        logLevel: isTest ? "error" : "info",
        server: {
          port: PORT,
          hmr: {
            protocol: "ws",
            host: "localhost",
            port: 64999,
            clientPort: 64999,
          },
          middlewareMode: "html",
        },
      })
    );
    app.use(vite.middlewares);
  } else {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    const fs = await import("fs");
    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      // Client-side routing will pick up on the correct route to render, so we always render the index here
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${process.cwd()}/dist/client/index.html`));
    });
  }

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) => app.listen(PORT));
}
