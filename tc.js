var	sys		= require('sys'),
	http	= require('http');

var	conn=http.createClient(80, "api.twitter.com"),
	couch=http.createClient(5984, '192.168.1.10');

function run (){
	var req=conn.request('GET', '/1/statuses/public_timeline.json', 
							{ host:'api.twitter.com'});

	req.on('response', function(response){
		var msg="";
		response.setEncoding('utf8');
		response.on('data', function(chunk){ msg+= chunk });
		response.on('end', function (){
			tweets=JSON.parse(msg);
			
			for(var i=0; i<tweets.length; i++){
				/<a href="(.+)" .+>(.+)<\/a>/.exec(tweets[i].source);
				var	data={
						name: RegExp.$2,
						url: RegExp.$1
					},
					json=JSON.stringify(data);
				if(!data.name)
					continue;

				var opt={
					method: 'PUT',
					url: '/twitter-clients/'+ encodeURI(data.name),
					headers: {
						'Content-Length': json.length, 
						'Content-Type': 'application/json'
					}
				}
				var cr=couch.request(opt.method, opt.url, opt.headers);
				cr.write(json, 'utf-8');
			}
		});
	});
	
	req.end();
	setTimeout(run, 24000);
}

run();
