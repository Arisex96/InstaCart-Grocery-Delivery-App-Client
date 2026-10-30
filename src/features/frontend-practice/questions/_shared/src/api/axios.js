// Fake stand-in for client/src/api/axios.ts. The sandbox has no network, so this
// "server" lives in memory. It keeps the real call shape:
//
//   const { data } = await api.get("/products", { params: { search, category, sort }, signal });
//   data.products -> [{ id, name, price, ... }]
//
// Tests (and you, in the console) can steer it with api.__configure(...).
import { serverProducts } from "../data/products";

const defaults = {
  latency: 60, // ms
  latencyFor: null, // (url, params) => ms, to make some requests slower than others
  failNext: 0, // how many upcoming requests should fail
  failStatus: 500,
};
let config = { ...defaults };

function canceled() {
  const error = new Error("canceled");
  error.name = "CanceledError";
  error.code = "ERR_CANCELED";
  return error;
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) return reject(canceled());
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(canceled());
      });
    }
  });
}

function httpError(status, message) {
  const error = new Error(message || "Request failed with status code " + status);
  error.response = { status, data: { message: message || "Server error" } };
  return error;
}

function route(method, url, params, body) {
  if (method === "get" && url === "/products") {
    let list = serverProducts.slice();
    if (params.category && params.category !== "all") list = list.filter((p) => p.category === params.category);
    if (params.search) {
      const q = String(params.search).toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }
    if (params.minPrice !== undefined && params.minPrice !== "") list = list.filter((p) => p.price >= Number(params.minPrice));
    if (params.maxPrice !== undefined && params.maxPrice !== "") list = list.filter((p) => p.price <= Number(params.maxPrice));
    if (params.sort === "price-low") list.sort((a, b) => a.price - b.price);
    if (params.sort === "price-high") list.sort((a, b) => b.price - a.price);
    return { products: list };
  }
  if (method === "get" && url.startsWith("/products/")) {
    const product = serverProducts.find((p) => p.id === url.split("/")[2]);
    if (!product) throw httpError(404, "Product not found");
    return { product };
  }
  if (method === "post" && url === "/cart/items") {
    const product = serverProducts.find((p) => p.id === body.productId);
    if (!product) throw httpError(404, "Product not found");
    if (body.quantity > product.stock) throw httpError(409, "Only " + product.stock + " in stock");
    return { productId: body.productId, quantity: body.quantity };
  }
  if (method === "post" && url === "/orders") {
    return { orderId: "o-" + Math.round(Math.random() * 1e6), status: "placed", total: body.total };
  }
  throw httpError(404, "No route for " + method.toUpperCase() + " " + url);
}

async function request(method, url, { params = {}, body, signal } = {}) {
  api.calls.push({ method, url, params, body });
  const wait = config.latencyFor ? config.latencyFor(url, params, body) : config.latency;
  await delay(wait, signal);
  if (config.failNext > 0) {
    config.failNext -= 1;
    throw httpError(config.failStatus);
  }
  return { data: route(method, url, params, body), status: 200 };
}

const api = {
  /** Every request made so far: { method, url, params, body }. */
  calls: [],
  get: (url, options) => request("get", url, options),
  post: (url, body, options) => request("post", url, { ...options, body }),
  put: (url, body, options) => request("put", url, { ...options, body }),
  delete: (url, options) => request("delete", url, options),
  __configure(patch) {
    config = { ...config, ...patch };
  },
  __reset() {
    config = { ...defaults };
    api.calls.length = 0;
  },
};

export default api;
