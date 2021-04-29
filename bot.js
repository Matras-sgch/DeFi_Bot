const { default: axios } = require("axios");
const { ChainId, Fetcher, WETH, Route, Token } = require("@uniswap/sdk");
const ethers = require("ethers");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
require("./db/mongoose");
const User = require("./models/user");
const fs = require("fs");
const cron = require("node-cron");

const dataBuffer = fs.readFileSync("ethTokens.json");
const change = 0.05;
let supportedPools;
let supportedPlatforms;

const readPlatforms = () => {
  const platformsBuffer = fs.readFileSync("platforms.json");
  const platformsJSON = platformsBuffer.toString();
  supportedPlatforms = JSON.parse(platformsJSON);
};

const readPools = () => {
  const poolsBuffer = fs.readFileSync("pools.json");
  const poolsJSON = poolsBuffer.toString();
  supportedPools = JSON.parse(poolsJSON);
  supportedPools = supportedPools.map((pool) => pool.exchange);
};



readPlatforms()
readPools();

const poolsApiKey = process.env.POOLS_API_KEY;
const coinmarketcapKey = process.env.COINMARKETCAP_KEY;
const etherscanKey = process.env.ETHERSCAN_KEY;
const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });



const chainId = ChainId.MAINNET;

axios
  .get(
    `https://data-api.defipulse.com/api/v1/blocklytics/pools/v1/exchanges?api-key=${poolsApiKey}`
  )
  .then(async (oldPools) => {
    let tokensCourse = [];
    axios
      .get(
        `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${etherscanKey}`
      )
      .then(async (data) => {
        for (let i = 0; i < supportedPools.length; i++) {
          let oldPool = oldPools.data.results.find(
            ({ exchange }) => exchange === supportedPools[i]
          );

          for (let j = 0; j < oldPool.assets.length; j++) {
            const repeat = tokensCourse.find(
              (el) => el[0] === oldPool.assets[j].address
            );
            if (!repeat) {
              if (
                oldPool.assets[j].address ===
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
              ) {
                tokensCourse.push([
                  oldPool.assets[j].address,
                  parseFloat(data.data.result.ethusd),
                ]);
              } else {
                const assetToken = new Token(
                  ChainId.MAINNET,
                  oldPool.assets[j].address,
                  18
                );
                const assetPair = await Fetcher.fetchPairData(
                  assetToken,
                  WETH[assetToken.chainId]
                );
                const assetRoute = new Route(
                  [assetPair],
                  WETH[assetToken.chainId]
                );

                const assetUsd =
                  data.data.result.ethusd /
                  assetRoute.midPrice.toSignificant(6);
                tokensCourse.push([oldPool.assets[j].address, assetUsd]);
              }
            }
          }
        }
      });

    bot.onText(/\/start/, async (msg) => {
      const id = msg.chat.id;
      const user = await User.findOne({ tg_chat_id: id });
      if (!user) {
        const user = new User({
          tg_chat_id: id,
        });
        await user.save();

        bot.sendMessage(id, "Hello, new user!");
      } else {
        bot.sendMessage(id, "Hello!");
      }
    });

    bot.onText(
      /\/setSpreadChange (.+)/,
      async (msg, [source, newSpreadChange]) => {
        const id = msg.chat.id;

        const spreadChangeTemplate = /^[0-9]*[.,]?[0-9]+$/;

        if (spreadChangeTemplate.test(newSpreadChange)) {
          const user = await User.findOne({ tg_chat_id: id });
          if (!user) {
            bot.sendMessage(id, "Who are you? Send /start command!");
          } else {
            user.spreadChange = newSpreadChange;
            await user.save();
            bot.sendMessage(id, "Updated!");
          }
        } else {
          bot.sendMessage(id, "invalid value");
        }
      }
    );

    bot.onText(/\/addCoin (.+)/, async (msg, [source, address]) => {
      const id = msg.chat.id;

      const addressTemplate = /^0x[a-fA-F0-9]{40}$/;

      if (addressTemplate.test(address)) {
        const user = await User.findOne({ tg_chat_id: id });
        if (!user) {
          bot.sendMessage(id, "Who are you? Send /start command!");
        } else {
          const coin = user.coins.find((coin) => coin === address);
          if (!coin) {
            user.coins.push(address);

            const coinIndex = user.coins.findIndex((coin) => coin === address)
            user.previousSpreadsValues.push({})

            const coinsListResp = await axios.get(
                "https://api.coingecko.com/api/v3/coins/list?include_platform=true");
            const coinFromList = coinsListResp.data.find(({ platforms }) => platforms.ethereum === address.toLowerCase());

        
              const coinDataResp = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${coinFromList.id}`
              );

            supportedPlatforms.forEach(platform => {
                const platformSpread = coinDataResp.data.tickers.find(({market}) => platform === market.identifier);
                if(!platformSpread) {
                    return
                }
                user.previousSpreadsValues[coinIndex][platform] = platformSpread.bid_ask_spread_percentage;
            })

              

            await user.save();

            bot.sendMessage(id, "Coin added! You track this coin.");
          } else {
            bot.sendMessage(id, "You track this coin.");
          }
        }
      } else {
        bot.sendMessage(id, "Coin addres is invalid.");
      }
    });

    bot.onText(/\/rmPool (.+)/, async (msg, [source, address]) => {
      const id = msg.chat.id;
      const user = await User.findOne({ tg_chat_id: id });

      if (!user) {
        bot.sendMessage(id, "Who are you? Send /start command!");
      } else {
        const poolForDeleteIndex = user.pools.findIndex((el) => el === address);
        if (poolForDeleteIndex === -1) {
          bot.sendMessage(id, "you don't have such pool");
        } else {
          user.pools.splice(poolForDeleteIndex, 1);
          user.save();
          bot.sendMessage(id, "pool removed!");
        }
      }
    });

    bot.onText(/\/addPool (.+)/, async (msg, [source, address]) => {
      const id = msg.chat.id;

      const addressTemplate = /^0x[a-fA-F0-9]{40}$/;
      const pools = supportedPools;

      if (addressTemplate.test(address)) {
        if (pools.includes(address)) {
          const user = await User.findOne({ tg_chat_id: id });
          if (!user) {
            bot.sendMessage(id, "Who are you? Send /start command!");
          } else {
            const pool = user.pools.filter((pool) => pool === address);
            if (pool.length === 0) {
              user.pools.push(address);
              user.save();
              bot.sendMessage(id, "Pool added! You track this pool.");
            } else {
              bot.sendMessage(id, "You track this pool.");
            }
          }
        } else {
          bot.sendMessage(id, `We don't support this pool(exchange)`);
        }
      } else {
        bot.sendMessage(id, "Pool(exchange) addres is invalid.");
      }
    });

    bot.onText(/\/coins/, async (msg) => {
      const id = msg.chat.id;

      axios
        .get(
          `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${etherscanKey}`
        )
        .then(async (data) => {
          const user = await User.findOne({ tg_chat_id: id });
          if (!user) {
            bot.sendMessage(id, "Who are you? Send /start command!");
          } else {
            let message = "Coins: \n";
            const coinsInfo = await getCoinsInfo(user.coins);

            for (let i = 0; i < coinsInfo.length; i++) {
              const coin = new Token(ChainId.MAINNET, coinsInfo[i].address, 18);
              const pair = await Fetcher.fetchPairData(
                coin,
                WETH[coin.chainId]
              );
              const route = new Route([pair], WETH[coin.chainId]);
              const coinUsd =
                data.data.result.ethusd / route.midPrice.toSignificant(6);
              message += `\n${coinsInfo[i][0].name} is ${coinUsd}$; hour change is ${coinsInfo[i][0].quote.USD.percent_change_1h}%`;
            }
            bot.sendMessage(id, message);
          }
        });
    });

    bot.onText(/\/coin (.+)/, async (msg, [source, symbol]) => {
      const id = msg.chat.id;
      const coinData = await getCoinPricesAndSpreads(symbol);
      bot.sendMessage(id, coinData);
    });

    bot.onText(/\/getPools (.+)/, async (msg, [source, address]) => {
      id = msg.chat.id;
      const pools = await getPools(address);
      bot.sendMessage(id, pools);
    });

    bot.onText(/\/funding/, async (msg) => {
      const id = msg.chat.id;
      const funding = await getFunding();
      bot.sendMessage(id, funding);
    });

    bot.onText(/\/gas/, async (msg) => {
      const id = msg.chat.id;
      const gas = await getGas();
      bot.sendMessage(id, gas);
    });

    const getFunding = async () => {
      const fundingResp = await axios.get(
        "https://fapi.binance.com/fapi/v1/fundingRate"
      );

      let funding = "Binance Futures and Funding rates: ";

      fundingResp.data.forEach(
        (element) =>
          (funding +=
            "\n " + element.symbol + ": " + element.fundingRate * 100 + ";")
      );

      return funding;
    };

    const getGas = async () => {
      const gasResp = await axios.get(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherscanKey}`
      );
      const gas = `fast - ${gasResp.data.result.FastGasPrice} 
Average - ${gasResp.data.result.ProposeGasPrice}
Low - ${gasResp.data.result.SafeGasPrice}`;
      return gas;
    };

    const getPools = async (address) => {
      const poolsResp = await axios.get(
        `https://data-api.defipulse.com/api/v1/blocklytics/pools/v1/exchanges?api-key=${poolsApiKey}`
      );
      let poolsRes = "pools: \n";
      let pools = [];
      poolsResp.data.results.forEach((pool) => {
        let count = 0;
        pool.assets.forEach((asset) => {
          if (asset.address === address) {
            count++;
          }
        });
        if (count > 0) {
          pools.push(pool);
        }
      });
      if (pools.length > 6) {
        pools = pools.slice(0, 6);
      }
      pools.forEach((pool) => {
        let assetsString = "";
        pool.assets.forEach((asset) => {
          assetsString +=
            "\n" +
            asset.symbol +
            ": balance = " +
            asset.balance +
            "; \nweight = " +
            asset.weight +
            "%";
        });
        poolsRes +=
          "\n" +
          pool.poolName +
          "\nVolume = " +
          pool.usdVolume +
          "$" +
          "\nLiquidity = " +
          pool.usdLiquidity +
          "$" +
          assetsString +
          "\n\n\n";
      });
      return poolsRes;
    };

    const getCoinsInfo = async (coinsAddresses) => {
      const coinResp = await axios.get(
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
        { headers: { "X-CMC_PRO_API_KEY": coinmarketcapKey } }
      );

      const coinsNames = coinsAddresses.map((address) =>
        getCoinNameByAddress(address)
      );
      const coinsInfo = coinsNames.map(({ symbol, address }) => {
        const info = coinResp.data.data.filter(
          (coin) => coin.symbol.toLowerCase() === symbol.toLowerCase()
        );
        return { ...info.flat(), address };
      });
      return coinsInfo;
    };

    const getCoinNameByAddress = (address) => {
      const coins = readJson();
      const coin = coins.filter(
        (coin) => coin.address.toLowerCase() === address.toLowerCase()
      );
      if (coin.length === 0) {
        return [];
      }
      return { symbol: coin[0].symbol, address };
    };

    const readJson = () => {
      try {
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
      } catch (e) {
        return [];
      }
    };

    const getCoinPricesAndSpreads = async (symb) => {
      let message = "";
      const coinsListResp = await axios.get(
        "https://api.coingecko.com/api/v3/coins/list"
      );
      const coinFromList = coinsListResp.data.find(
        ({ symbol }) => symb.toLowerCase() === symbol.toLowerCase()
      );
      if (!coinFromList) {
        return "No coin with this symbol";
      }

      const coinDataResp = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinFromList.id}`
      );

      if (coinDataResp.data.tickers.length > 25) {
        coinDataResp.data.tickers = coinDataResp.data.tickers.slice(0, 16);
      }

      coinDataResp.data.tickers.forEach(
        ({ market, bid_ask_spread_percentage, converted_last }) =>
          (message += `${market.name}: price=${converted_last.usd}$; spread=${
            bid_ask_spread_percentage ? bid_ask_spread_percentage : 0
          }%\n`)
      );
      return message;
    };

    cron.schedule("20 * * * * *", async () => {
      const freshPools = await axios.get(
        `https://data-api.defipulse.com/api/v1/blocklytics/pools/v1/exchanges?api-key=${poolsApiKey}`
      );
      let users = await User.find();

      supportedPools.forEach((pool) => {
        let freshPool = freshPools.data.results.find(
          ({ exchange }) => exchange === pool
        );
        let oldPool = oldPools.data.results.find(
          ({ exchange }) => exchange === pool
        );

        const filteredUsers = users.filter(({ pools }) => {
          return pools.includes(pool);
        });

        if (
          Math.abs(freshPool.usdLiquidity - oldPool.usdLiquidity) /
            oldPool.usdLiquidity >=
          0.05
        ) {
          //
          if (freshPool.usdLiquidity - oldPool.usdLiquidity > 0) {
            filteredUsers.forEach(({ tg_chat_id }) => {
              bot.sendMessage(
                tg_chat_id,
                `🚀🚀Liquifity for ${freshPool.poolName} is ${freshPool.usdLiquidity} 🚀🚀`
              );
              oldPools = freshPools;
            });
          }
          if (freshPool.usdLiquidity - oldPool.usdLiquidity < 0) {
            filteredUsers.forEach(({ tg_chat_id }) => {
              bot.sendMessage(
                tg_chat_id,
                `🔻️🔻️Liquifity for ${freshPool.poolName} is ${freshPool.usdLiquidity} 🔻️🔻️`
              );
              oldPools = freshPools;
            });
          }
        }
      });
    });

    cron.schedule("10 * * * * *", async () => {
      let users = await User.find();
      await axios
        .get(
          `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${etherscanKey}`
        )
        .then(async (data) => {
          for (let i = 0; i < supportedPools.length; i++) {
            let oldPool = oldPools.data.results.find(
              ({ exchange }) => exchange === supportedPools[i]
            );

            const filteredUsers = users.filter((user) => {
              return user.pools.includes(supportedPools[i]);
            });

            for (let j = 0; j < oldPool.assets.length; j++) {
              let tokenFromCourseList = tokensCourse.find(
                (el) => el[0] === oldPool.assets[j].address
              );
              let newAssetUsd;
              if (tokenFromCourseList) {
                tokenIndex = tokensCourse.findIndex(
                  (el) => el[0] === oldPool.assets[j].address
                );

                if (
                  oldPool.assets[j].address ===
                  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
                ) {
                  if (
                    Math.abs(tokenFromCourseList[1] - data.data.result.ethusd) /
                      tokenFromCourseList[1] >
                    change
                  ) {
                    if (tokenFromCourseList[1] - data.data.result.ethusd > 0) {
                      filteredUsers.forEach(({ tg_chat_id }) => {
                        console.log(
                          `🔻️🔻️ ${oldPool.assets[j].symbol} is ${data.data.result.ethusd}$`
                        );
                        bot.sendMessage(
                          tg_chat_id,
                          `🔻️🔻️ ${oldPool.assets[j].symbol} is ${data.data.result.ethusd}$`
                        );
                        tokensCourse[tokenIndex][1] = data.data.result.ethusd;
                      });
                    } else {
                      filteredUsers.forEach(({ tg_chat_id }) => {
                        console.log(
                          `🚀🚀 ${oldPool.assets[j].symbol} is ${data.data.result.ethusd} $`
                        );
                        bot.sendMessage(
                          tg_chat_id,
                          `🚀🚀 ${oldPool.assets[j].symbol} is ${data.data.result.ethusd}$`
                        );
                        tokensCourse[tokenIndex][1] = data.data.result.ethusd;
                      });
                    }
                  }
                } else {
                  const freshAssetToken = new Token(
                    ChainId.MAINNET,
                    oldPool.assets[j].address,
                    18
                  );
                  const freshAssetPair = await Fetcher.fetchPairData(
                    freshAssetToken,
                    WETH[freshAssetToken.chainId]
                  );
                  const freshAssetRoute = new Route(
                    [freshAssetPair],
                    WETH[freshAssetToken.chainId]
                  );

                  const freshAssetUsd =
                    data.data.result.ethusd /
                    freshAssetRoute.midPrice.toSignificant(6);
                  if (
                    Math.abs(tokenFromCourseList[1] - freshAssetUsd) /
                      tokenFromCourseList[1] >
                    change
                  ) {
                    if (tokenFromCourseList[1] - freshAssetUsd > 0) {
                      filteredUsers.forEach(({ tg_chat_id }) => {
                        console.log(
                          `🔻️🔻️ ${oldPool.assets[j].symbol} is ${freshAssetUsd}$`
                        );
                        bot.sendMessage(
                          tg_chat_id,
                          `🔻️🔻️ ${oldPool.assets[j].symbol} is ${freshAssetUsd}$`
                        );
                        tokensCourse[tokenIndex][1] = freshAssetUsd;
                      });
                    } else {
                      filteredUsers.forEach(({ tg_chat_id }) => {
                        console.log(
                          `🚀🚀 ${oldPool.assets[j].symbol} is ${freshAssetUsd}$`
                        );
                        bot.sendMessage(
                          tg_chat_id,
                          `🚀🚀 ${oldPool.assets[j].symbol} is ${freshAssetUsd}$`
                        );
                        tokensCourse[tokenIndex][1] = freshAssetUsd;
                      });
                    }
                  }
                }
              } else {
                const newAssetToken = new Token(
                  ChainId.MAINNET,
                  oldPool.assets[j].address,
                  18
                );
                const newAssetPair = await Fetcher.fetchPairData(
                  newAssetToken,
                  WETH[newAssetToken.chainId]
                );
                const newAssetRoute = new Route(
                  [newAssetPair],
                  WETH[newAssetToken.chainId]
                );

                newAssetUsd =
                  data.data.result.ethusd /
                  newAssetRoute.midPrice.toSignificant(6);
              }
              tokensCourse.push([oldPool.assets[j].address, newAssetUsd]);
            }
          }
        });
    });

    cron.schedule("15 * * * * *", async () => {
        let users = await User.find();
        const coinsListResp = await axios.get(
            "https://api.coingecko.com/api/v3/coins/list?include_platform=true"
          );

        for(let i = 0; i < users.length; i++ ){
            for(let j = 0; j < users[i].previousSpreadsValues.length; j++) {
                
                const coinFromList = coinsListResp.data.find(({ platforms }) => platforms.ethereum === users[i].coins[j].toLowerCase());
                const coinDataResp = await axios.get(
                    `https://api.coingecko.com/api/v3/coins/${coinFromList.id}`
                  );

                const previousSpreadsValuesArray = Object.entries(users[i].previousSpreadsValues[j]);
                for(let k = 0; k < previousSpreadsValuesArray.length; k++) {
                    const newPlatformSpread = coinDataResp.data.tickers.find(({ market }) => previousSpreadsValuesArray[k][0] === market.identifier)
                    if(!newPlatformSpread) {
                        return
                    }
                    if (Math.abs(previousSpreadsValuesArray[k][1] - newPlatformSpread.bid_ask_spread_percentage) >= users[i].spreadChange) {
                        if (previousSpreadsValuesArray[k][1] - newPlatformSpread.bid_ask_spread_percentage > 0) {
                            bot.sendMessage(users[i].tg_chat_id, `🔻️🔻️ Spread for ${coinFromList.symbol}: 🔻️🔻️ to ${newPlatformSpread.bid_ask_spread_percentage}% from ${previousSpreadsValuesArray[k][1]}% at ${previousSpreadsValuesArray[k][0]} platform.`);
                            users[i].previousSpreadsValues[j][previousSpreadsValuesArray[k][0]] = newPlatformSpread.bid_ask_spread_percentage;
                            users[i].markModified("previousSpreadsValues");
                            await users[i].save()
                        } else {
                            bot.sendMessage(users[i].tg_chat_id, `🚀🚀 Spread for ${coinFromList.symbol}: 🚀🚀 to ${newPlatformSpread.bid_ask_spread_percentage}% from ${previousSpreadsValuesArray[k][1]}% at ${previousSpreadsValuesArray[k][0]} platform.`);
                            users[i].previousSpreadsValues[j][previousSpreadsValuesArray[k][0]] = newPlatformSpread.bid_ask_spread_percentage;
                            users[i].markModified("previousSpreadsValues");
                            await users[i].save()
                        }
                    }
                }
            }
        }
    });
  });
