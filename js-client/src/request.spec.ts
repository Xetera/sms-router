import { describe, it, expect } from "vitest";
import { SmsRouter } from "./index.js";

describe("sms router", () => {
  const router = new SmsRouter({
    secret: "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b",
  });
  it("retrieves list of sms", async () => {
    const list = await router.list();
    expect(list).toBeTruthy();
  });
});
