# middlewares.py

import random
import time
import pickle
import os
from urllib.parse import urlparse

class UltraFastStealthMiddleware:
    def __init__(self):
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Safari/605.1.15',
        ]
        self.request_count = 0
        
    def get_realistic_headers(self, user_agent):
        """Headers realiste bazate pe user agent"""
        base_headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        }
        
        if 'Chrome' in user_agent and 'Edg' not in user_agent:
            base_headers.update({
                'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            })
        elif 'Firefox' in user_agent:
            del base_headers['Sec-Fetch-Dest']
            del base_headers['Sec-Fetch-Mode'] 
            del base_headers['Sec-Fetch-Site']
            del base_headers['Sec-Fetch-User']
        elif 'Safari' in user_agent:
            base_headers.update({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            })
            
        return base_headers
    
    def process_request(self, request, spider):
        if self.request_count % random.randint(30, 80) == 0:
            user_agent = random.choice(self.user_agents)
            request.headers['User-Agent'] = user_agent
            
            realistic_headers = self.get_realistic_headers(user_agent)
            for key, value in realistic_headers.items():
                request.headers[key] = value
                
        if random.random() < 0.2:
            referers = [
                'https://www.google.com/',
                'https://www.google.ro/',
            ]
            request.headers['Referer'] = random.choice(referers)
            
        self.request_count += 1

class FastHumanBehaviorMiddleware:
    def __init__(self):
        self.last_request_time = {}
        self.domain_request_counts = {}
        
    def get_domain(self, url):
        return urlparse(url).netloc
        
    def process_request(self, request, spider):
        domain = self.get_domain(request.url)
        current_time = time.time()
        
        if domain in self.last_request_time:
            time_since_last = current_time - self.last_request_time[domain]
            
            if time_since_last < 0.05:
                sleep_time = random.uniform(0.1, 0.3)
                time.sleep(sleep_time)
        
        self.domain_request_counts[domain] = self.domain_request_counts.get(domain, 0) + 1
        
        if self.domain_request_counts[domain] % random.randint(500, 800) == 0:
            pause_time = random.uniform(2, 5)
            spider.logger.info(f"Quick break: {pause_time:.1f}s after {self.domain_request_counts[domain]} requests")
            time.sleep(pause_time)
        
        self.last_request_time[domain] = time.time()

class FingerprintRandomizationMiddleware:
    def process_request(self, request, spider):
        headers_dict = dict(request.headers)
        headers_list = list(headers_dict.items())
        random.shuffle(headers_list)
        
        request.headers.clear()
        for key, value in headers_list:
            request.headers[key] = value
            
        optional_headers = {
            'Accept-CH': 'Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform',
            'Sec-Purpose': 'prefetch',
            'Purpose': 'prefetch',
        }
        
        for _ in range(random.randint(0, 2)):
            header, value = random.choice(list(optional_headers.items()))
            if random.random() < 0.4:
                request.headers[header] = value

class SessionPersistenceMiddleware:
    def __init__(self):
        self.cookies_file = 'scrapy_cookies.pkl'
        self.cookies = self.load_cookies()
        
    def load_cookies(self):
        if os.path.exists(self.cookies_file):
            try:
                with open(self.cookies_file, 'rb') as f:
                    return pickle.load(f)
            except:
                return {}
        return {}
    
    def save_cookies(self):
        with open(self.cookies_file, 'wb') as f:
            pickle.dump(self.cookies, f)
    
    def get_domain(self, url):
        return urlparse(url).netloc
    
    def process_request(self, request, spider):
        domain = self.get_domain(request.url)
        if domain in self.cookies:
            for cookie in self.cookies[domain]:
                request.cookies[cookie['name']] = cookie['value']
    
    def process_response(self, request, response, spider):
        domain = self.get_domain(request.url)
        
        if 'Set-Cookie' in response.headers:
            if domain not in self.cookies:
                self.cookies[domain] = []
                
            cookie_header = response.headers['Set-Cookie'].decode()
            cookie_parts = cookie_header.split(';')[0].split('=', 1)
            if len(cookie_parts) == 2:
                self.cookies[domain].append({
                    'name': cookie_parts[0].strip(),
                    'value': cookie_parts[1].strip()
                })
                self.save_cookies()
        
        return response

class AntiCloudflareMiddleware:
    def __init__(self):
        self.cloudflare_detected = False
        
    def process_response(self, request, response, spider):
        if response.status in [429, 403]:
            spider.cloudflare_blocks += 1
            print(f"🚨 CLOUDFLARE DETECTED {response.status} - STOPPING SPIDER!")
            
            car_id = request.meta.get('car_id')
            if car_id:
                spider.save_last_processed_id(car_id)
            
            spider.crawler.engine.close_spider(spider, f"Cloudflare {response.status}")
            spider.crawler.engine.stop()
            
        return response