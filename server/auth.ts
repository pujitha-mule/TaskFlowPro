// server/auth.ts
import * as client from "openid-client";
import { Strategy as OpenIdStrategy } from "openid-client/passport";

import passport from "passport";
import session, { type SessionOptions } from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

type TokenLike = any; // intentionally loose to avoid brittle external lib types

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession(): ReturnType<typeof session> {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStoreFactory = connectPg(session as any);
  const sessionStore = new pgStoreFactory({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const options: SessionOptions = {
    secret: process.env.SESSION_SECRET ?? "dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  };

  return session(options);
}

function updateUserSession(user: any, tokens: TokenLike) {
  try {
    if (typeof tokens.claims === "function") {
      user.claims = tokens.claims();
    } else {
      user.claims = tokens.claims ?? tokens;
    }
  } catch {
    user.claims = tokens.claims ?? tokens;
  }

  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  if (!claims || !claims["sub"]) return;
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  // loose verify function
  const verify = async (tokens: TokenLike, done: (err: any, user?: any) => void) => {
    try {
      const user: any = {};
      updateUserSession(user, tokens);
      await upsertUser(typeof tokens.claims === "function" ? tokens.claims() : tokens.claims);
      done(null, user);
    } catch (err) {
      done(err);
    }
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new OpenIdStrategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy as any);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: any, cb: (err: any, result?: any) => void) => cb(null, user));
  passport.deserializeUser((user: any, cb: (err: any, result?: any) => void) => cb(null, user));

  app.get("/api/login", (req: Request, res: Response, next: NextFunction) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req: Request, res: Response, next: NextFunction) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req: Request, res: Response) => {
    const cb = () => {
      const endSessionUrl = client.buildEndSessionUrl(config, {
        client_id: process.env.REPL_ID,
        post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
      });
      res.redirect(endSessionUrl?.href ?? "/");
    };

    if (typeof req.logout === "function") {
      try {
        (req as any).logout(cb);
      } catch {
        (req as any).logout?.();
        cb();
      }
    } else {
      res.redirect("/");
    }
  });
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as any;

  if (!req.isAuthenticated?.() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
