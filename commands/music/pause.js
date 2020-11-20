const { canModifyQueue } = require("../../utils/musicUtil.js");

module.exports = {
  name: "pause",
  aliases: [],
  category: "music",
  description: "Pause the currently playing music",
  run (client, message, args, lang) {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (queue.playing) {
      queue.playing = false;
      queue.connection.dispatcher.pause(true);
      return queue.textChannel.send(`${message.author} ⏸ paused the music.`).catch(console.error);
    }
  }
};
