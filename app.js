var restify = require('restify');
var irc = require('irc');

var botNick = 'botenjson';
var channel = '#gather.fi';

var client = new irc.Client('irc.quakenet.org', botNick, {
    channels: [channel],
    floodProtection: true,
});

var gatherTopic = {
	// maxPlayers: 12,
	map: "cp_gravelpit",
	players: [],
	// motd: "http://tf2.fi/gatherfi"
};


// Next cp_badlands: Snappe,V1llukka,josee,irppa,wrdo,Tunttu,Santtu 7/12 http://tf2.fi/gatherfi
var formatTopic = function(topic) {
	var splitted = topic.split(' ');
	var map = splitted[1].replace(':','');
	var players = splitted[2].split(',');
	if (players[0] == "0/12") {
		players = [];
	}
	return {
		map: map,
		players: players
	};
};

client.addListener('join' + channel, function(nick,message) {
	if (nick == botNick) {
		client.say(channel,'!hl off');
	}
});

client.addListener('topic', function(channel,topic,nick,message) {
	console.log(topic);
	gatherTopic = formatTopic(topic);
	console.log(gatherTopic);
});

function respond(req, res, next) {
  res.send(gatherTopic);
  next();
}

var server = restify.createServer();
server.get('/gatherStatus', respond);
server.head('/gatherStatus', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
