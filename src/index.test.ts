import { expect, test, describe, expectTypeOf } from "vitest";
import { kp } from "./index";

// Test helpers and mock functions
async function fetchName(name: string) {
  return name + "_" + 100;
}

async function fetchNumber(num: number) {
  return num;
}

async function fetchObject(id: string) {
  return { id, value: 100 };
}

async function failingFetch() {
  throw new Error("Failed to fetch");
}

describe("KeyedPromise", () => {
  describe("all", () => {
    test("should handle mixed return types correctly", async () => {
      const data = {
        tom: () => fetchName("tom"),
        jerry: () => fetchName("jerry"),
        bob: () => fetchNumber(100),
        alice: () => fetchNumber(200),
      };

      const result = await kp.all(data);

      // Type checks
      expectTypeOf(result.alice).toBeNumber();
      expectTypeOf(result.bob).toBeNumber();
      expectTypeOf(result.tom).toBeString();
      expectTypeOf(result.jerry).toBeString();

      // Value checks
      expect(result).toEqual({
        tom: "tom_100",
        jerry: "jerry_100",
        bob: 100,
        alice: 200,
      });
    });

    test("should handle complex object returns", async () => {
      const data = {
        user1: () => fetchObject("1"),
        user2: () => fetchObject("2"),
      };

      const result = await kp.all(data);

      expectTypeOf(result.user1).toMatchTypeOf<{ id: string; value: number }>();

      expect(result).toEqual({
        user1: { id: "1", value: 100 },
        user2: { id: "2", value: 100 },
      });
    });

    test("should reject if any promise fails", async () => {
      const data = {
        success: () => fetchName("success"),
        failure: () => failingFetch(),
      };

      await expect(kp.all(data)).rejects.toThrow("Failed to fetch");
    });
  });

  describe("allSettled", () => {
    test("should handle successful promises", async () => {
      const data = {
        user: async function () {
          return { id: "1", value: 100 };
        },
        products: async function () {
          return [
            { id: "1", value: 100 },
            { id: "2", value: 200 },
          ];
        },
      };

      const result = await kp.allSettled({
        user: async function () {
          return { id: "1", value: 100 };
        },
        products: async function () {
          return [
            { id: "1", value: 100 },
            { id: "2", value: 200 },
          ];
        },
      });

      if (result.user.status === "fulfilled") {
        expectTypeOf(result.user.value).toMatchTypeOf<{
          id: string;
          value: number;
        }>();
      }

      if (result.products.status === "fulfilled") {
        expectTypeOf(result.products.value).toMatchTypeOf<
          {
            id: string;
            value: number;
          }[]
        >();
      }

      expect(result).toEqual({
        user: { status: "fulfilled", value: { id: "1", value: 100 } },
        products: {
          status: "fulfilled",
          value: [
            { id: "1", value: 100 },
            { id: "2", value: 200 },
          ],
        },
      });
    });

    test("should handle mixed success and failure", async () => {
      const data = {
        success1: () => fetchName("success"),
        failure: () => failingFetch(),
        success2: () => fetchNumber(200),
      };

      const result = await kp.allSettled(data);

      expect(result.success1.status).toBe("fulfilled");
      expect(result.success2.status).toBe("fulfilled");
      if (result.success1.status === "fulfilled") {
        expect(result.success1.value).toBe("success_100");
      }
      if (result.success2.status === "fulfilled") {
        expect(result.success2.value).toBe(200);
      }

      // Failure checks
      expect(result.failure.status).toBe("rejected");
      if (result.failure.status === "rejected") {
        expect(result.failure.reason).toBeInstanceOf(Error);
        expect(result.failure.reason.message).toBe("Failed to fetch");
      }
    });

    test("should handle empty input", async () => {
      const data = {};
      const result = await kp.allSettled(data);
      expect(result).toEqual({});
    });
  });

  describe("Type edge cases", () => {
    test("should handle promises returning void", async () => {
      async function voidFunction() {
        return;
      }

      const data = {
        void: () => voidFunction(),
      };

      const result = await kp.all(data);
      expectTypeOf(result.void).toBeUndefined;
    });

    test("should handle promises returning null", async () => {
      async function nullFunction() {
        return null;
      }

      const data = {
        null: () => nullFunction(),
      };

      const result = await kp.all(data);
      expectTypeOf(result.null).toBeNull();
    });
  });
});
