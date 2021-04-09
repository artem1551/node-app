const TelegrammBot = require('node-telegram-bot-api');
const TOKEN = '1739958820:AAEsK_ljktxCf7kQ0EGriS-A3AjeaYytzCc';
const startKey = require('./startKey');
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 2020;
const API_WEATHER = 'http://localhost:1010/current/weather';
const API_FORECAST_WEATHER = 'http://localhost:1010/forecast/weather';

const bot = new TelegrammBot(TOKEN, {
  polling: {
    interval: 300,
    autoStrat: true,
    params: {
      timeout: 10,
    },
  },
});

app.get('/weather/:city', (req, res) => {
  fetch(`http://localhost:1010/weather/London`)
    .then(resp => resp.json())
    .then(data => res.json(data));
});

bot.onText(/\/start/, msg => {
  const { id } = msg.chat;
  bot.sendMessage(
    id,
    `${msg.from.first_name}  для начала нажмите ↓↓↓↓↓`,
    {
      reply_markup: {
        keyboard: startKey.home,
      },
    }
  );

  bot.on('message', msg => {
    const { id } = msg.chat;

    if (msg.text) {
      let city = msg.text.replace(/[^a-z]/g, '');
      let elemNumber = parseInt(msg.text.match(/\d+/));

      if (elemNumber === 1) {
        weatherToday(API_WEATHER, city, id);
      } else if (elemNumber === 5) {
        forecastWeather(API_FORECAST_WEATHER, city, id);
      } else {
        bot.sendMessage(
          id,
          `- Только латиница -
          - Прогноз на один день (city 1) -
          - Прогноз на неделю (city 5) - `,
          {
            reply_markup: {
              hide_keyboard: true,
            },
          }
        );
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Start http://localhost:${port}`);
});

const weatherToday = (ApiAdrress, userMessage, id) => {
  return fetch(`${ApiAdrress}/${userMessage}`)
    .then(resp => resp.json())
    .then(
      data =>
        // bot.sendMessage(id, data.sys.sunrise, data.sys.sunset, data.timezone) &&
        bot.sendMessage(
          id,
          `       В городе ${userMessage} температура - ${JSON.stringify(
            data.main.temp
          )}°C
Max температура - ${JSON.stringify(data.main.temp_max)}°C
Min температура - ${JSON.stringify(data.main.temp_min)}°C
          `
        )
    )
    .catch(error =>
      error === userMessage
        ? bot.sendMessage(
            id,
            `Запрос "${userMessage}" неправильный. Пример (today dnipro)`
          )
        : null
    );
};

const forecastWeather = (ApiAdrress, userMessage, id) => {
  return fetch(`${ApiAdrress}/${userMessage}`)
    .then(resp => resp.json())
    .then(data =>
      bot.sendMessage(
        id,
          `В городе ${userMessage.toUpperCase()}` +
            JSON.stringify(
              data.list.map(data => ` ${data.dt_txt} температура ожидается ${data.main.temp}c`),
              null,
              '\t'
            ).replace(/\[|\]|\/^"|"/g, '')
      )
    )
    .catch(error =>
      error === userMessage
        ? bot.sendMessage(
            id,
            `Запрос "${userMessage}" неправильный. Пример (today dnipro)`
          )
        : null
    );
};