const fs = require("fs");
const dir = "src/constants/token-data";

fs.readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .forEach((f) => {
    const path = dir + "/" + f;
    const data = JSON.parse(fs.readFileSync(path, "utf8"));

    const strip = (obj) => ({
      chainId: obj.chainId,
      erc20TokenAddress: obj.erc20TokenAddress,
      name: obj.name,
      symbol: obj.symbol,
    });

    const result = Array.isArray(data)
      ? data.map(strip)
      : Object.fromEntries(
          Object.entries(data).map(([k, v]) => [
            k,
            Array.isArray(v) ? v.map(strip) : v,
          ]),
        );

    fs.writeFileSync(path, JSON.stringify(result, null, 2));
    console.log("Done:", f);
  });
