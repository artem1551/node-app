const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const port = 1010;

const weatherOptions = {
  protocol: 'http://',
  domain: 'api.openweathermap.org',
  resourseBase: '/data/2.5',
  API_KEY: '5a47c9b44d7984c6fb2057876def73a5',
};
const { protocol, domain, resourseBase, API_KEY } = weatherOptions;
const weatherPath = `${protocol}${domain}${resourseBase}`;

fetch(`${weatherPath}/weather?appid=${API_KEY}&units=metric&q=Dnipro`)
  .then(resp => resp.json())
  .then(data => console.log(data.main.feels_like));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static(__dirname + './../'));

app.all('*', (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);

  next();
});

app.get('/current/weather/:city', (req, res) => {
  fetch(`${weatherPath}/weather?appid=${API_KEY}&units=metric&q=${req.params.city}`)
    .then(resp => resp.json())
    .then(data => res.json(data));
});

app.get('/forecast/weather/:city', (req, res) => {
  fetch(`${weatherPath}/forecast?id=524901&appid=${API_KEY}&units=metric&q=${req.params.city}`)
    .then(resp => resp.json())
    .then(data => res.json(data));
});

app.listen(port, () => {
  console.log(`Start http://localhost:${port}`);
});