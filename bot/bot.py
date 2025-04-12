# bot/bot.py
from telegram import Update, Bot
from telegram.ext import Updater, CommandHandler
from typing import Dict, List  # В начале файла

# Пример исправления в bot.py:
def send_arbitrage_alert(self, chat_id: int, arbitrage: Dict[str, float]):
    ...

class NotificationBot:
    def __init__(self, token: str):
        self.bot = Bot(token=token)
        self.updater = Updater(token=token, use_context=True)
        self.updater.dispatcher.add_handler(CommandHandler("start", self.start))

    def start(self, update: Update, context):
        context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="🔍 Бот для поиска вилок активирован!"
        )

    def send_arbitrage_alert(self, chat_id: int, arbitrage: Dict):
        message = (
            f"🎯 Найдена вилка!\n"
            f"📌 Событие: {arbitrage['event']}\n"
            f"💰 Прибыль: {arbitrage['profit']}%\n"
            f"⚡ Ставки: {arbitrage['stakes']}"
        )
        self.bot.send_message(chat_id=chat_id, text=message)

    def run(self):
        self.updater.start_polling()