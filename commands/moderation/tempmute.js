const discord = require("discord.js");
const ms = require("ms");
const config = require("../../config.json");

module.exports = {
    name: "tempmute",
    description: "Mute people temporarily.",
    category: "moderation",
    usage: "tempmute <@user> <time> [reason]",
    run: async (client, message, args) => {

        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            let embed = new discord.MessageEmbed()
                .setColor(0xe80b30)
                .setDescription(":x: You need the Manage Messages permission to run this command!")
            return message.channel.send(embed)
        }

        if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
            let embed = new discord.MessageEmbed()
                .setColor(0xe80b30)
                .setDescription(":x: I need the Manage Roles permission to run this command!")
            return message.channel.send(embed)
        }

        let user = message.mentions.members.first() || message.guild.members.cache.find(m => m.user.tag === args[0]) || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(m => m.user.username === args[0]);
        if (!user) {
            let embed = new discord.MessageEmbed()
                .setColor(0xe80b30)
                .setDescription(":x: Please mention a user to tempmute!")
            return message.channel.send(embed)
        }

        if (message.guild.member(user).hasPermission('MANAGE_MESSAGES') || message.guild.member(user).hasPermission('ADMINISTRATOR')) {
            let embed = new discord.MessageEmbed()
                .setColor(0xe80b30)
                .setDescription(":x: You can't mute a moderator!")
            return message.channel.send(embed);
        }

        let time = args[1];
        if (!time || isNaN(ms(time))) {
            let embed = new discord.MessageEmbed()
                .setColor(0xe80b30)
                .setDescription(":x: Please provide a valid time in `s, m, h, d or w`!")
            return message.channel.send(embed);
        }

        let reason = args.slice(2).join(" ");
        if (!reason) {
            reason = "Unspecified."
        }

        if (!user.kickable) {
            let embed = new discord.MessageEmbed()
                .setColor(0xe80b30)
                .setDescription(":x: Cannot mute them!")
        };

        if (ms(time) > 172800000000) {
            return message.channel.send("You exceeded the maximum mute time.");
        };

        let mute = await message.guild.roles.cache.find(r => r.name == "Muted");
        if (!mute) {
            await message.guild.roles.create({
                data: {
                    name: "Muted",
                    color: "#000000",
                }
            }).then((role) => {
                mute = role;
            });
        };

        if (user.roles.cache.has(mute.id)) {
            let embed = new discord.MessageEmbed()
                .setColor(0xe80b30)
                .setDescription("The user is already muted!")
            return message.channel.send(embed);
        }

        user.roles.add(mute.id).then(() => {
            message.guild.channels.cache.forEach(ch => {
                ch.updateOverwrite(mute, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                })
            })

            let embed = new discord.MessageEmbed()
                .setColor(0x2D2D2D)
                .setAuthor(`${user.user.tag} has been muted for ${ms(ms(time), { long: true })}`, user.user.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(`**Reason:** ${reason}\n\n[\`[unmute]\`](${config.main_url}/manage/${message.guild.id}/unmute/${user.id})`)
                .setFooter("Muted until")
                .setTimestamp(new Date().getTime() + ms(time));

            client[`mute${message.guild.id}${user.id}`] = {
                guild: message.guild,
                role: mute,
                user: user
            };

            message.channel.send(embed)
            setTimeout(() => {
                user.roles.remove(mute.id)
                delete client[`mute${message.guild.id}${user.id}`];
            }, ms(time))
        })
    }
}