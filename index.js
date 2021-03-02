const express = require('express')
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens.
// If modifying these scopes, delete token.json.
const TOKEN_PATH = 'token.json';
const CREDENTIAL_PATH = 'credentials.json';
const SCRIPT_ID = 'AKfycbzhPOSC_eTQGzkt-p95W_KCrNAOJ_cC6gAMWifkL2RVYLzzYVhTQ7gZ';

function createOAuth2Client() {
  let credential;
  credential = fs.readFileSync(CREDENTIAL_PATH);
  console.log(JSON.parse(credential));
  const {client_secret, client_id, redirect_uris} = JSON.parse(credential).installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function authorize() {
  console.log('call authorize');

  let oAuth2Client, token;
  try {
    oAuth2Client = createOAuth2Client();
    token = fs.readFileSync(TOKEN_PATH);
  } catch (e) {
    console.error(e);
    return null;
  }
  oAuth2Client.setCredentials(JSON.parse(token));
  return oAuth2Client;
}

/**
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param resource Apps Script function name / parametes object.
 */
async function runScript(auth, resource) {
  console.log('call runScript');

  const scriptId = SCRIPT_ID;
  const script = google.script({version: 'v1', auth});
  return await script.scripts.run({
    scriptId: scriptId,
    resource: resource
  });
}

async function callGasFunction(resource) {
  const auth = await authorize();
  if (!auth) {
    return {message: 'Authorize failed. maybe missing credential or token file. To create token,visit https://yourhost/auth '};
  }
  let res;
  try {
    res = await runScript(auth, resource);
  } catch (e) {
    console.error(e);
    return {message: 'Apps Script internal error occured.'};
  }
  if (res.data.error) {
    console.error(res.data.error);
    return {message: 'Apps Script error occured.'};
  }
  const result = res.data.response.result
  console.log(result);
  return result;
}

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/auth', async (req, res) => {
  const oAuth2Client = createOAuth2Client();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('authUrl:', authUrl);
  res.send(`<a href="${authUrl}" target="_new">${authUrl}</a><form method="post" action="/token" ><input type="text" name="code"></input><input type="submit" value="create token" /></form>`);
})

app.post('/token', async (req, res) => {
  const code = req.body.code;
  console.log('code:' + code);

  const oAuth2Client = createOAuth2Client();
  let token;
  try {
    token = (await oAuth2Client.getToken(code)).res.data;
    console.log(token);
  } catch (e) {
    res.status(500).send('Error retrieving access token');
    return console.error('Error retrieving access token', e);
  }
  oAuth2Client.setCredentials(token);
  try {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  } catch (e) {
    res.status(500).send('Error while writing token');
    return console.error(e);
  }
  console.log('Token stored to', TOKEN_PATH);
  res.send('Token stored to ' + TOKEN_PATH);
})

app.get('/folders', async (req, res) => {
  const result = await callGasFunction({
    function: 'getFolders'});
  res.json(result);
})

app.get('/folders/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const result = await callGasFunction({
    function: 'getFolder',
    parameters: [id]
  });
  if (result.error) {
    return res.status(400).json(result.error);
  }
  res.json(result);
})

app.post('/folders', async (req, res) => {
  console.log(req.body);

  const folderName = req.body.folderName;
  const result = await callGasFunction({
    function: 'addFolder',
    parameters: [folderName]
  });
  res.json(result);
})

app.put('/folders/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  console.log(req.body);

  const folderName = req.body.folderName;
  const result = await callGasFunction({
    function: 'setFolderName',
    parameters: [id, folderName]
  });
  if (result.error) {
    return res.status(400).json(result.error);
  }
  res.json(result);
})

app.delete('/folders/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  console.log(req.body);

  const result = await callGasFunction({
    function: 'removeFolder',
    parameters: [id]
  });
  if (result.error) {
    return res.status(400).json(result.error);
  }
  res.json(result);
})

const server = app.listen(process.env.PORT || 9000, () => {
  console.log('Listening on port %d', server.address().port)
});
