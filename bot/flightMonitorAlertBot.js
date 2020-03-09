const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');

module.exports = class FlightMonitorAlertBot {
    constructor() {
        this.token = process.env.TELEGRAM_FLIGHT_MONITOR_BOT_TOKEN;
        this.chatId = process.env.TELEGRAM_ALERT_GROUP_ID;
        this.bot = new TelegramBot(this.token, {
            polling: true,
        });
    }

    sendMessage(message) {        
        let currentDatetime = moment().format('DD/MM/YYYY HH:mm:ss');
        console.log(`[${currentDatetime}] ${message}`);
        this.bot.sendMessage(this.chatId, `[${currentDatetime}] ${message}`);
    }
}