from celery.schedules import crontab
from tasks import app

app.conf.beat_schedule = {
    'scan-every-5-minutes': {
        'task': 'tasks.scan_arbitrages',
        'schedule': crontab(minute='*/5'),  # Каждые 5 минут
    },
    'fast-scan-for-live': {
        'task': 'tasks.scan_arbitrages',
        'schedule': crontab(minute='*'),  # Каждую минуту (для live)
        'kwargs': {'is_live': True},  # Параметр для фильтрации live-событий
    },
}