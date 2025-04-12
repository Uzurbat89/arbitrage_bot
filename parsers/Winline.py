# parsers/winline.py
from selenium import webdriver
from selenium.webdriver.common.by import By

class WinlineParser:
    def __init__(self):
        self.url = "https://www.winline.ru/live/"
        self.driver = webdriver.Chrome()

    def parse_events(self):
        self.driver.get(self.url)
        events = []
        
        for event in self.driver.find_elements(By.CSS_SELECTOR, ".event"):
            name = event.find_element(By.CSS_SELECTOR, ".event-name").text
            odds = {
                "1": float(event.find_element(By.CSS_SELECTOR, ".odd1").text),
                "X": float(event.find_element(By.CSS_SELECTOR, ".oddX").text),
                "2": float(event.find_element(By.CSS_SELECTOR, ".odd2").text),
            }
            events.append({"event": name, "odds": odds})
        
        self.driver.quit()
        return events