export const kp = {
  async all<T extends Record<string, () => Promise<any>>>(
    data: T
  ): Promise<{
    [P in keyof T]: Awaited<ReturnType<T[P]>>;
  }> {
    const keys = Object.keys(data);
    const promises = Object.values(data).map((fn) => fn());

    const results = await Promise.all(promises);

    return results.reduce((acc, result, index) => {
      acc[keys[index]] = result;
      return acc;
    }, {} as { [P in keyof T]: Awaited<ReturnType<T[P]>> });
  },

  async allSettled<T extends Record<string, () => Promise<any>>>(
    data: T
  ): Promise<{
    [P in keyof T]:
      | {
          status: "fulfilled";
          value: Awaited<ReturnType<T[P]>>;
        }
      | {
          status: "rejected";
          reason: any;
        };
  }> {
    type Result = {
      [P in keyof T]:
        | {
            status: "fulfilled";
            value: Awaited<ReturnType<T[P]>>;
          }
        | {
            status: "rejected";
            reason: any;
          };
    };

    const results: Result = {} as Result;
    const entries = Object.entries(data) as [keyof T, T[keyof T]][];

    const settledPromises = await Promise.allSettled(
      entries.map(([_, fn]) => fn())
    );

    for (let i = 0; i < entries.length; i++) {
      const [key] = entries[i];
      results[key] = settledPromises[i];
    }

    return results;
  },
};

export default kp;
