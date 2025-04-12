from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import asyncio
import random

# Инициализация FastAPI приложения
app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Разрешаем запросы от React-приложения
    allow_methods=["*"],
    allow_headers=["*"],
)

# Заглушка для генерации тестовых данных
def generate_fake_arbitrages(is_live: bool = False) -> List[Dict]:
    sports = ["Футбол", "Теннис", "Баскетбол", "Хоккей"]
    bookmakers = ["Fonbet", "Winline", "Betcity", "Leon"]
    
    return [
        {
            "event": f"Матч {i}",
            "sport": random.choice(sports),
            "profit": round(random.uniform(1.5, 10.0), 2),
            "bookmakers": random.sample(bookmakers, 2),
            "is_live": is_live
        }
        for i in range(1, 6)
    ]

# Функция для получения live-вилок (заглушка)
def get_live_arbitrages() -> List[Dict]:
    return generate_fake_arbitrages(is_live=True)

# Основной endpoint для получения вилок
@app.get("/api/arbitrages")
async def get_arbitrages(is_live: bool = False):
    """Возвращает список вилок (прематч или live)"""
    if is_live:
        return {"data": get_live_arbitrages()}
    return {"data": generate_fake_arbitrages(is_live=False)}

# Endpoint для детальной информации о вилке
@app.get("/api/arbitrage/{arb_id}")
async def get_arbitrage(arb_id: int):
    """Возвращает детальную информацию о конкретной вилке"""
    fake_data = generate_fake_arbitrages()
    if arb_id < len(fake_data):
        return fake_data[arb_id]
    return {"error": "Vilka not found"}

# WebSocket для live-обновлений
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket соединение для передачи live-вилок"""
    await websocket.accept()
    try:
        while True:
            data = get_live_arbitrages()
            await websocket.send_json({"data": data})
            await asyncio.sleep(1)  # Обновление каждую секунду
    except WebSocketDisconnect:
        print("Client disconnected")

# Запуск: uvicorn dashboard.backend:app --reload