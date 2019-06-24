const Discord = require('discord.js');
const client = new Discord.Client();

const command = /^\?quote(?: <#\d+>(?: (\d+)| (.*))?)?$/;

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	const match = msg.content.match(command);
	if( match) {
		if( msg.mentions.channels.size !== 1) {
			msg.reply('quote requires exactly 1 Channel mention.\nUsage: `$snap #channel-name` or `$snap #channel-name messageID` or `$snap #channel-name message content`');
		}
		else {
			const target = msg.mentions.channels.first();
			const record = id => {
				const params = {limit:1}; // could adjust to get messages before/after the selected one.
				if( id) params.around = id;
				target.fetchMessages(params).then(messages => {
					let isfirst = true;
					[...messages.entries()].sort((a,b)=>a[0]-b[0]).forEach(([_,m]) => {
						const opts = {
							embed: {
								description: m.content.replace(/\[/g,'\\['), // escape [ to prevent named links from parsing
								timestamp: new Date(m.createdTimestamp),
								author: {
									name: (m.member ? m.member.nickname : '') || m.author.username,
									icon_url: m.author.displayAvatarURL
								},
								footer: {
									text: 'Message posted'
								}
							}
						};
						if( isfirst) {
							msg.reply('quote requested:', opts);
							isfirst = false;
						}
						else {
							msg.channel.send('', opts);
						}
					});
				}).catch(console.error);
				
			};
			if( match[2]) {
				// search for this message content
				target.fetchMessages({limit:100}).then(messages => {
					const msgs = [...messages.values()], len = msgs.length;
					let i=0;
					for( ; i<len; i++) {
						if( msgs[i].content.includes(match[2])) {
							record(msgs[i].id);
							break;
						}
					}
					if( i === len) msg.reply('quote could not find the specified search string.');
				}).catch(console.error);
			}
			else {
				record(match[1]);
			}
		}
	}
});

const config = require('./config.json');
client.login(config.token);