// Coming back to the page you wanted after signing in, after Flask-Login's login_url and make_next_param: a signed-out
// visit sends you to /login?next=<that page>, and a password sign-in takes you back there.

// The login screen's address for this page. Like make_next_param, next only keeps the path and query. The board's
// home page is where sign-in lands anyway, so it doesn't need one.
export const loginUrlFor = ({ pathname, search }) =>
  {
    const next = `${pathname}${search}`;
    if(next === "/") return "/login";
    return `/login?${new URLSearchParams({ next })}`;
  };

// Where to go after signing in. next comes from the address bar, so anyone can write it: only a path on this app
// counts, never another site. "//site.com" and "/\site.com" both open another site in a browser, and a browser drops
// tabs and line breaks from addresses, so "/<tab>/site.com" would too. Anything else goes to the board's home page.
export const safeNext = (next) =>
  {
    if(typeof next !== "string" || !next.startsWith("/")) return "/";
    if(next.startsWith("//") || next.startsWith("/\\")) return "/";
    if(/[\u0000-\u001f\u007f]/.test(next)) return "/";
    return next;
  };
