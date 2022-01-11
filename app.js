const { App } = require('@slack/bolt');
const { Console } = require('console');
const https = require('https');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000
});

// Listens to incoming messages that contain "hello"
app.message('case escalate', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
	 text: `Hey there <@${message.user}>!`
	});
});


app.command('/escalate', async ({ ack, payload, client }) => {
  // Acknowledge shortcut request
  ack();

  try {
    // Call the views.open method using the WebClient passed to listeners
    const result = await client.views.open({
      trigger_id: payload.trigger_id,
	view: {
"type": "modal",
	"callback_id": "casecommment_action",
	"title": {
		"type": "plain_text",
		"text": "My App",
		"emoji": true
	},
	"submit": {
		"type": "plain_text",
		"text": "Escalate",
		"emoji": true
	},
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"blocks": [
		{
			"type": "input",
			"block_id":"cn",
			"element": {
				"type": "plain_text_input",
				"action_id": "case_number"
			},
			"label": {
				"type": "plain_text",
				"text": "Case Number",
				"emoji": true
			}
		},
		{
			"type": "input",
			"block_id":"comm",
			"element": {
				"type": "plain_text_input",
				"action_id": "comment"
			},
			"label": {
				"type": "plain_text",
				"text": "Comment",
				"emoji": true
			}
		}
	]
}
});
 console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.view('casecommment_action',async ({ ack, body, view, client }) => { 
   await ack();

	
const options = {
  hostname: 'login.salesforce.com',
  port: 443,
  path: '/services/oauth2/token?grant_type=password&client_id=2934302292113.2914983207910&client_secret=e7526505e678cea7591f5eb5b26165a9&username=chandu.ch@springml.com&password=rally1237AHYGGQ4mO886oZGxvqvOMtE',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}
var jsondata;
var accesstoken;
var instance_url;
const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    console.log(d.toString());
	jsondata = JSON.parse(d.toString());
	accesstoken = jsondata.access_token;
	instance_url = jsondata.instance_url;
	instance_url = instance_url.replace("https://", "");
	console.log('accesstoken '+accesstoken);
	console.log('instance_url '+instance_url);

	//new
	var test = instance_url;
	

console.log(accesstoken);
const data1 = JSON.stringify({
		
	casenumber : `${view.state.values.cn.case_number.value}`,
	comments : `${view.state.values.comm.comment.value}`

})
const options1 = {
	hostname: test,
	port: 443,
	path: '/services/apexrest/Case',
	method: 'POST',
	headers: {
	  'Content-Type': 'application/json',
	  'Content-Length': data1.length,
	  'Authorization':'OAuth '+accesstoken
	}
  }
  const req1 = https.request(options1, res1 => {
	console.log(`statusCode: ${res1.statusCode}`)
  
	res1.on('data', d => {
	  console.log(d.toString());
	})
  });
  
  
  req1.on('error', error => {
	console.error(error)
  })
  req1.write(data1);
  req1.end()

  })
});

req.on('error', error => {
  console.error(error)
})

req.end()

   console.log(`<@${body.user.id}> You entered the case number as the ${view.state.values.cn.case_number.value} and case comment as ${view.state.values.comm.comment.value} `);
});

(async () => {
  // Start your app
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();