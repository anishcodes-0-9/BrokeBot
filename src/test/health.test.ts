import { describe, expect, it } from "vitest";
import { api } from "./helpers.js";

describe("health routes", () => {
  it("returns the root api response", async () => {
    const response = await api.get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      name: "BrokeBot API",
      version: "phase-1.2",
    });
    expect(typeof response.body.requestId).toBe("string");
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("returns the health payload", async () => {
    const response = await api.get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.service).toBe("brokebot-api");
    expect(typeof response.body.data.timestamp).toBe("string");
    expect(typeof response.body.requestId).toBe("string");
  });

  it("returns 404 for unknown routes", async () => {
    const response = await api.get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Route not found");
    expect(typeof response.body.requestId).toBe("string");
  });
});
