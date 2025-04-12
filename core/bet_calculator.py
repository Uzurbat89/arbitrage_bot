# core/bet_calculator.py
from typing import Dict, List
class BetCalculator:
    @staticmethod
    def calculate_bets(odds1: float, odds2: float, max_bet: float = 1000) -> Dict:
        total = 1 / odds1 + 1 / odds2
        if total >= 1:
            return None  # Нет вилки
        
        stake1 = 100 / odds1  # Упрощённый расчёт
        stake2 = 100 / odds2
        
        if stake1 > max_bet or stake2 > max_bet:
            return None  # Превышен лимит
        
        profit = 100 - (stake1 + stake2)
        if profit > 15:  # Учитываем налог 13% при доходе >15k
            profit *= 0.87
        
        return {
            "stake1": round(stake1, 2),
            "stake2": round(stake2, 2),
            "profit": round(profit, 2)
        }