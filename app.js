// gather-json
// -----------

// IRC bot that brings the status of #gather.fi to the web!
// Made by Jarppa.


// The bot requires restify and irc modules from npm to work
var restify = require('restify');
var irc = require('irc');

var botNick = 'botenjson';
var channel = '#gather.fi';

// Let's initiate the IRC client
var client = new irc.Client('irc.quakenet.org', botNick, {
    channels: [channel],
    floodProtection: true,
});

// These are the defaults values that API returns if there's no info about #gather.fi's topic.
var gatherTopic = {
	map: "cp_gravelpit",
	players: [],
};

// This holds the time of last played gather. It changes when GatherFI announces that the game starts.
var lastPlayed = 1;

// This takes care of parsing the topic.
var formatTopic = function(topic) {
	var splitted = topic.split(' ');
	var map = splitted[1].replace(':','');
	var players = splitted[2].split(',');
	// This happens if the topic has no players. Kinda clumsy.
	if (players[0] == "0/12") {
		players = [];
	}
	return {
		map: map,
		players: players
	};
};

// Here's where the magic happens. When the topic changes, this triggers formatTopic() to parse it and saves it to gatherTopic variable.
client.addListener('topic', function(channel,topic,nick,message) {
	console.log(topic);
	gatherTopic = formatTopic(topic);
	console.log(gatherTopic);
});

client.addListener('message' + channel, function(nick,text,message) {
	// If the GatherFI announces that the game starts, this will update the information about the last played game.
	if (nick == "GatherFI" && text.indexOf("Gatheri alkaa!")) {
		lastPlayed = new Date() / 1000;
	}
});

// And here comes the restify stuff that hosts the API!
function respond(req, res, next) {
  res.send(gatherTopic);
  next();
}

var server = restify.createServer({ name: 'gather-json', version: '0.2.0'});
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.get('/gatherStatus', respond);
server.head('/gatherStatus', respond);

// BAM!
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
