# core/arbitrage.py
from typing import List, Dict

class ArbitrageFinder:
    def __init__(self, tax_threshold=15000, tax_rate=0.13):
        self.tax_threshold = tax_threshold
        self.tax_rate = tax_rate

    def find_arbitrages(self, bookmaker1: Dict, bookmaker2: Dict) -> List[Dict]:
        arbitrages = []
        
        for event1 in bookmaker1:
            for event2 in bookmaker2:
                if event1["event"] == event2["event"]:
                    for outcome in ["1", "X", "2"]:
                        k1 = event1["odds"][outcome]
                        k2 = event2["odds"][outcome]
                        
                        if (1/k1 + 1/k2) < 1:  # Вилка найдена
                            profit = (1 - (1/k1 + 1/k2)) * 100
                            arbitrages.append({
                                "event": event1["event"],
                                "outcome": outcome,
                                "profit": profit,
                                "odds": {"bookmaker1": k1, "bookmaker2": k2}
                            })
        
        return arbitrages