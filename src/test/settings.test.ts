import { describe, expect, it } from "vitest";
import { api } from "./helpers.js";

describe("settings routes", () => {
  it("returns an empty settings array by default", async () => {
    const response = await api.get("/api/settings");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: [],
      requestId: response.body.requestId,
    });
    expect(typeof response.body.requestId).toBe("string");
  });

  it("saves settings and returns the saved count", async () => {
    const payload = {
      settings: [
        { key: "dailyLimit", value: 50 },
        { key: "salaryThresholdLpa", value: 18 },
        {
          key: "roleKeywords",
          value: [
            "software engineer",
            "frontend engineer",
            "full stack engineer",
          ],
        },
      ],
    };

    const postResponse = await api.post("/api/settings").send(payload);

    expect(postResponse.status).toBe(201);
    expect(postResponse.body.success).toBe(true);
    expect(postResponse.body.data).toEqual({
      savedCount: 3,
    });
    expect(postResponse.body.message).toBe("Settings saved");
    expect(typeof postResponse.body.requestId).toBe("string");

    const getResponse = await api.get("/api/settings");

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data).toHaveLength(3);
    expect(getResponse.body.data[0].key).toBe("dailyLimit");
    expect(getResponse.body.data[1].key).toBe("roleKeywords");
    expect(getResponse.body.data[2].key).toBe("salaryThresholdLpa");
  });

  it("returns a single setting by key", async () => {
    await api.post("/api/settings").send({
      settings: [{ key: "dailyLimit", value: 50 }],
    });

    const response = await api.get("/api/settings/dailyLimit");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.key).toBe("dailyLimit");
    expect(response.body.data.value).toBe(50);
    expect(typeof response.body.requestId).toBe("string");
  });

  it("returns 404 for a missing setting", async () => {
    const response = await api.get("/api/settings/openaiApiKey");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Setting 'openaiApiKey' not found");
    expect(typeof response.body.requestId).toBe("string");
  });

  it("returns 400 for malformed json", async () => {
    const response = await api
      .post("/api/settings")
      .set("Content-Type", "application/json")
      .send('{"settings":}');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Malformed JSON body");
    expect(typeof response.body.requestId).toBe("string");
  });

  it("returns 400 for invalid payload shape", async () => {
    const response = await api.post("/api/settings").send({
      settings: [],
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
    expect(typeof response.body.requestId).toBe("string");
  });

  it("returns 400 for duplicate keys in the same request", async () => {
    const response = await api.post("/api/settings").send({
      settings: [
        { key: "dailyLimit", value: 50 },
        { key: "dailyLimit", value: 75 },
      ],
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      "Duplicate setting key 'dailyLimit' in request",
    );
  });

  it("trims keys before saving", async () => {
    await api.post("/api/settings").send({
      settings: [{ key: "  dailyLimit  ", value: 50 }],
    });

    const response = await api.get("/api/settings/dailyLimit");

    expect(response.status).toBe(200);
    expect(response.body.data.key).toBe("dailyLimit");
  });
});
