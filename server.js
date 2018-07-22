// server.js
const {PASSWORD, TRELLO_KEY, TRELLO_TOKEN} = process.env;

// Setup Trello API connection
const Trello = require("node-trello");
const t = new Trello(TRELLO_KEY, TRELLO_TOKEN);

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + '/app/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
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

app.post("/cards.json", function(request, response) {
  if (request.body.password !== PASSWORD) {
    return response.status(400).send("WRONG PASSWORD");
  }
  console.warn('/cards.json');
  console.warn(request.body);
  const sendBody = {
    limit:200,
    fields:'all',
    //fields:'⏳,🔁,name',
    members:true,
    member_fields:'fullName',
    customFieldItems:true
  };
  const customFieldMapping = {
    '🔁': {
      id: '5ab8f5a28d3ddde1fa45f3c2',
      type: 'text'
    },
    '⏳': {
      id: '5ab8f55a09c74796cda187b0',
      type: 'number'
    }
  };
  const extractCustomFieldValue = (customFieldItems, customFieldKey) => {
    const found = customFieldItems.find(item => (customFieldMapping[customFieldKey] && customFieldMapping[customFieldKey].id) === item.idCustomField);
    return found ? found.value[customFieldMapping[customFieldKey].type] : undefined;
  }
  t.get(`/1/boards/${request.body.boardId}/cards/open`, sendBody, (err, data) => {
    if (err) throw err;
    const flatCards = data.map(data => {
      const flatCard = {
        name: data.name,
        memberIds: data.members.map(member => member.id),
        '🔁': extractCustomFieldValue(data.customFieldItems, '🔁'),
        '⏳': extractCustomFieldValue(data.customFieldItems, '⏳'),
      };
      return flatCard;
    });
    
    const repeatingEstimatedFlatCards = flatCards.filter(card => card['🔁'] && card['⏳']);
    response.send(repeatingEstimatedFlatCards);
  })
});


/*
*Get cards on Astige board (permuted later)*
https://api.trello.com/1/boards/NzgVa7UE/cards/?limit=2&fields=⏳,🔁,name&members=true&member_fields=fullName&key=97d532c0601e9d936cd3331d5aa96a80&token=ab5bcf9f9781696cc8372205d45a5b94377dfa09540008ec5bff925e4e02ac4f

*Custom fields on Astige board (don't need)*
https://api.trello.com/1/boards/NzgVa7UE/customFields?&key=97d532c0601e9d936cd3331d5aa96a80&token=ab5bcf9f9781696cc8372205d45a5b94377dfa09540008ec5bff925e4e02ac4f

*With Custom Fields (the only API call we need I think)*
https://api.trello.com/1/boards/NzgVa7UE/cards/open?limit=200&fields=all&members=true&member_fields=fullName&key=97d532c0601e9d936cd3331d5aa96a80&token=ab5bcf9f9781696cc8372205d45a5b94377dfa09540008ec5bff925e4e02ac4f&customFieldItems=true
*/