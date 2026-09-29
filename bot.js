if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mineflayer = require('mineflayer');

function createAfkBot() {
  const bot = mineflayer.createBot({
    host: technosmp.seedloaf.gg
    port: 61412,
    username: AFKBot,
    auth: 'offline',
    version: process.env.MC_VERSION === "false" ? false : process.env.MC_VERSION,
    viewDistance: Number(process.env.BOT_CHUNK)
  });

  let movementPhase = 0;
  const STEP_INTERVAL = 1500;
  const JUMP_DURATION = 500;
  let movementTimer = null;

  bot.once('spawn', () => {
    console.log(`🚀 Spawned as ${process.env.BOT_USERNAME}`);

    // Sneak after spawn for stability
    setTimeout(() => {
      bot.setControlState('sneak', true);
      console.log("✅ Bot is ready & sneaking.");
    }, 2000);

    // Start movement loop
    movementTimer = setTimeout(() => movementCycle(bot), STEP_INTERVAL);
  });

  function movementCycle(bot) {
    if (!bot.entity || bot.health === 0) {
      movementTimer = setTimeout(() => movementCycle(bot), STEP_INTERVAL);
      return;
    }

    switch (movementPhase) {
      case 0:
        bot.setControlState("forward", true);
        bot.setControlState("back", false);
        bot.setControlState("jump", false);
        break;

      case 1:
        bot.setControlState("forward", false);
        bot.setControlState("back", true);
        bot.setControlState("jump", false);
        break;

      case 2:
        bot.setControlState("forward", false);
        bot.setControlState("back", false);
        bot.setControlState("jump", true);
        setTimeout(() => bot.setControlState("jump", false), JUMP_DURATION);
        break;

      case 3:
        bot.setControlState("forward", false);
        bot.setControlState("back", false);
        bot.setControlState("jump", false);
        break;
    }

    movementPhase = (movementPhase + 1) % 4;
    movementTimer = setTimeout(() => movementCycle(bot), STEP_INTERVAL);
  }

  // Auto-reconnect on error
  bot.on("end", () => {
    console.log("⚠️ Bot disconnected! Reconnecting in 5 seconds...");
    clearTimeout(movementTimer);
    setTimeout(createAfkBot, 5000);
  });

  bot.on("error", (err) => {
    console.log("❌ Error:", err.message);
  });

  return bot;
}

// Start bot
createAfkBot();
