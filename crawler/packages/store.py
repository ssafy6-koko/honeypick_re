import requests
from bs4 import BeautifulSoup
import json
import re

class Store:
    def __init__(self) -> None:
        pass
    
    def smartstore_get_data(self, res):
        try:
            sp = BeautifulSoup(res, 'html.parser')
            title, brand = json.loads(sp.select_one('script').text)['name'].split(' : ')
            thumbnail = sp.select_one('._23RpOU6xpc > img').attrs['src']

            prices = sp.select('._1LY7DqCnwR')
            if len(prices) > 1:
                price_before, price_after = prices
                price_before = price_before.text.replace(',', '')
                price_after = price_after.text.replace(',', '')
                discount_rate = int(100 - int(price_after) / int(price_before) * 100)
            else:
                price_before = prices[0].text.replace(',', '')
                price_after = None
                discount_rate = 0

            return {
                'title': title,
                'brand': brand,
                'priceBefore': price_before,
                'priceAfter':price_after,
                'discountRate': discount_rate,
                'thumbnail':thumbnail,
            }
        except:
            return self.etc_get_data(res)
    
    def brandnaver_get_data(self, res):
        try:
            sp = BeautifulSoup(res, 'html.parser')
            title, brand = json.loads(sp.select_one('script').text)['name'].split(' : ')
            thumbnail = sp.select_one('._23RpOU6xpc > img').attrs['src']

            prices = sp.select('._1LY7DqCnwR')
            if len(prices) > 1:
                price_before, price_after = prices
                price_before = price_before.text.replace(',', '')
                price_after = price_after.text.replace(',', '')
                discount_rate = int(100 - int(price_after) / int(price_before) * 100)
            else:
                price_before = prices[0].text.replace(',', '')
                price_after = None
                discount_rate = 0

            return {
                'title': title,
                'brand': brand,
                'priceBefore': price_before,
                'priceAfter':price_after,
                'discountRate': discount_rate,
                'thumbnail':thumbnail,
            }
        except:
            return self.etc_get_data(res)
    
    def shoppingnaver_get_data(self, res):
        try:
            sp = BeautifulSoup(res, 'html.parser')
            title = sp.select_one('._3oDjSvLwq9').text
            brand = sp.select_one('._2o_RMIOix6').text
            thumbnail = sp.select_one('._23RpOU6xpc > img').attrs['src']

            prices = sp.select('._1LY7DqCnwR')
            if len(prices) > 1:
                price_before, price_after = prices
                price_before = price_before.text.replace(',', '')
                price_after = price_after.text.replace(',', '')
                discount_rate = int(100 - int(price_after) / int(price_before) * 100)
            else:
                price_before = prices[0].text.replace(',', '')
                price_after = None
                discount_rate = 0

            return {
                'title': title,
                'brand': brand,
                'priceBefore': price_before,
                'priceAfter':price_after,
                'discountRate': discount_rate,
                'thumbnail':thumbnail,
            }
        except:
            return self.etc_get_data(res)

    def etc_get_data(self, res):
        sp = BeautifulSoup(res, 'html.parser')
        title = sp.select_one('title').text
        price = re.search('[0-9\,]+원', sp.select_one('body').text)
        
        thumbnail = sp.select_one('img')
        # brand 정보

        return {
            'title': title,
            'priceBefore': price.group(0) if price else None,
            'thumbnail': thumbnail.attrs['src'] if thumbnail else None,
        }
    
    def crawl(self, url):
        r = requests.get(url)
        store_type = None

        # url 저장
        with open('./urls', 'a') as f:
            f.write(url+'\n')
        
        # 스토어 타입 구분
        if 'smartstore' in r.url:
            store_type = 'smartstore'
        elif 'shopping.naver' in r.url:
            store_type = 'shoppingnaver'
        elif 'brand.naver' in r.url:
            store_type = 'brandnaver'
        
        # 스토어 타입 별 데이터 크롤링
        if store_type == 'smartstore':
            data = self.smartstore_get_data(r.text)
        elif store_type == 'brandnaver':
            data = self.brandnaver_get_data(r.text)
        elif store_type == 'shoppingnaver':
            data = self.shoppingnaver_get_data(r.text)
        else:
            data = self.etc_get_data(r.text)
        
        return data


if __name__ == '__main__':
    store = Store()
    with open('../datas/urls.txt', 'r') as f:
        urls = [l.rstrip() for l in f.readlines()]
    
    # async
    for url in urls:
        store.crawl(url)

