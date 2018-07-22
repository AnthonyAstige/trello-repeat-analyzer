const Trello = require("node-trello");
const express = require('express');
const bodyParser = require('body-parser');

const {PASSWORD, TRELLO_KEY, TRELLO_TOKEN, TRELLO_PROCESS_LISTS_IDS, TRELLO_CUSTOM_FIELD_REPEAT_IDS, TRELLO_CUSTOM_FIELD_ESTIMATE_IDS} = process.env;
const t = new Trello(TRELLO_KEY, TRELLO_TOKEN);
const app = express();

// protocol check, if http, redirect to https
// https://support.glitch.com/t/solved-auto-redirect-http-https/2392
const forceHttps = (req, res, next) => {
   if (req.get('X-Forwarded-Proto').indexOf("https") === -1) {
    res.redirect('https://' + req.hostname + req.url);
    return;
  }
  next();
};
app.all('*', forceHttps);

// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + '/app/index.html');
});

app.get("/boards.json", function(request, response) {
  t.get("/1/members/me/boards", { filter: "open", fields: "id,name" }, (err, data) => {
    if (err) throw err;
    response.send(data);
  });
});

app.post("/members.json", function(request, response) {
  if (request.body.password !== PASSWORD) {
    return response.status(400).send("WRONG PASSWORD");
  }
  t.get(`/1/boards/${request.body.boardId}/members`, (err, data) => {
    if (err) throw err;
    response.send(data);
  });
});

const customFieldMapping = {};
TRELLO_CUSTOM_FIELD_REPEAT_IDS.split(',').forEach(id => customFieldMapping[id] = '🔁');
TRELLO_CUSTOM_FIELD_ESTIMATE_IDS.split(',').forEach(id => customFieldMapping[id] = '⏳');

app.post("/cards.json", function(request, response) {
  if (request.body.password !== PASSWORD) {
    return response.status(400).send("WRONG PASSWORD");
  }
  const extractCustomFieldValue = (customFieldItems, customFieldKey) => {
    const found = customFieldItems.find(customFieldItem => customFieldKey === customFieldMapping[customFieldItem.idCustomField])
    return found ? found.value.text || found.value.number : undefined;
  }
  const sendBody = {
    limit:2000,
    fields:'all',
    members:true,
    member_fields:'fullName',
    customFieldItems:true
  };
  t.get(`/1/boards/${request.body.boardId}/cards/open`, sendBody, (err, data) => {
    if (err) throw err;
    const flatCards = data.map(data => {
      // console.log(data);
      const flatCard = {
        name: data.name,
        memberIds: data.members.map(member => member.id),
        idList: data.idList,
        url: data.url,
        '🔁': extractCustomFieldValue(data.customFieldItems, '🔁'),
        '⏳': extractCustomFieldValue(data.customFieldItems, '⏳')
      };
      return flatCard;
    });

    const processListIds = TRELLO_PROCESS_LISTS_IDS.split(',');
    const isRepeatingAndEstimated = card => card['🔁'] && card['⏳'];
    const inProcessList = card => processListIds.includes(card.idList);
    const hasASelectedMember = card => card.memberIds.some(memberId => request.body.selectedMembers.includes(memberId));
    const hasNoMembers = (card) => card.memberIds.length === 0;
    
    const filteredFlatCards = flatCards
      .filter(isRepeatingAndEstimated)
      .filter(inProcessList)
      .filter(request.body.selectedMembers.length ? hasASelectedMember : hasNoMembers);
    response.send(filteredFlatCards);
  })
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

/*
*Get cards on Astige board (permuted later)*
https://api.trello.com/1/boards/NzgVa7UE/cards/?limit=2&fields=⏳,🔁,name&members=true&member_fields=fullName&key=97d532c0601e9d936cd3331d5aa96a80&token=ab5bcf9f9781696cc8372205d45a5b94377dfa09540008ec5bff925e4e02ac4f

*Custom fields on Astige board (Could use maybe to avoid configuration)*
https://api.trello.com/1/boards/NzgVa7UE/customFields?&key=97d532c0601e9d936cd3331d5aa96a80&token=ab5bcf9f9781696cc8372205d45a5b94377dfa09540008ec5bff925e4e02ac4f

*With Custom Fields (the only API call we need I think)*
https://api.trello.com/1/boards/NzgVa7UE/cards/open?limit=200&fields=all&members=true&member_fields=fullName&key=97d532c0601e9d936cd3331d5aa96a80&token=ab5bcf9f9781696cc8372205d45a5b94377dfa09540008ec5bff925e4e02ac4f&customFieldItems=true
*/