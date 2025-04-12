# parsers/fonbet.py
import aiohttp
from bs4 import BeautifulSoup

class FonbetParser:
    def __init__(self):
        self.url = "https://www.fonbet.ru/live/"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    async def fetch_events(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(self.url, headers=self.headers) as response:
                html = await response.text()
                soup = BeautifulSoup(html, "html.parser")
                
                events = []
                for event in soup.select(".live-event"):
                    name = event.select_one(".event__name").text
                    odds = {
                        "1": float(event.select_one(".bet-btn__1").text),
                        "X": float(event.select_one(".bet-btn__X").text),
                        "2": float(event.select_one(".bet-btn__2").text),
                    }
                    events.append({"event": name, "odds": odds})
                
                return events