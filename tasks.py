from celery import Celery
from parsers.Fonbet import FonbetParser
from parsers.Winline import WinlineParser
from core.arbitrage import ArbitrageFinder

app = Celery('tasks', broker='redis://localhost:6379/0')

@app.task
def scan_arbitrages():
    # Парсим данные
    fonbet_events = FonbetParser().fetch_events()
    winline_events = WinlineParser().parse_events()
    
    # Ищем вилки
    finder = ArbitrageFinder()
    arbitrages = finder.find_arbitrages(fonbet_events, winline_events)
    
    return arbitrages