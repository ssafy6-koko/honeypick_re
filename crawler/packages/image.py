import urllib3
def get_image(url):
    http = urllib3.PoolManager()
    d = http.request('GET', url)
    
    return [d.info().get('Content-Type'), d.data]