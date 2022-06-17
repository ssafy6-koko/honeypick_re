from fastapi import FastAPI, HTTPException, Header
from typing import Optional

from pymongo import MongoClient
from bson.objectid import ObjectId

from packages import config, store, image
import requests, json

# 서버 실행 명령어
# uvicorn main:app --reload --port=8081

################### 서버 실행 전 셋팅 ###################

secret = config.read_secret('.env')

SERVER_URL = secret.get('SERVER_URL')

import boto3

try:
    client = MongoClient(secret.get('MONGODB_URI'))
    db = client.get_database(secret.get('DB_NAME'))
    item_collection = db.get_collection('items')
    print('MongoDB connected')
    
    honey_bucket = boto3.resource('s3', 
                                    aws_access_key_id=secret.get('AWS_ACCESS_KEY'), 
                                    aws_secret_access_key=secret.get('AWS_SECRET_KEY'))\
                                    .Bucket('honeypick-image')
    print('AWS S3 connected')
except:
    print('MongoDB connect error')

crawler = store.Store()

################### 서버 실행  ###################

app = FastAPI()

# data types - req.body
from models.index import Item

@app.post("/item")
def crawl_item(item: Item, user_id: Optional[str] = Header(None, convert_underscores=False)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="userId is not valid")

    if not item.item_id:
        raise HTTPException(status_code=400, detail="item_id is required")
    if not item.url:
        raise HTTPException(status_code=400, detail="url is required")
    
    try:
        object_id = ObjectId(item.item_id)
    except:
        raise HTTPException(status_code=400, detail="invalid itemId")

    data = crawler.crawl(item.url)

    # thumbnail 버켓에 저장
    thumbnail_url = data.pop('thumbnail')
    content_type, image_data = image.get_image(thumbnail_url)
    res = requests.post(f'{SERVER_URL}/api/v1/item/{object_id}/presigned', data=json.dumps({ 'contentType': content_type }))
    presigned_data = res.json()['presigned']
    requests.post(presigned_data['url'], files={
        **{k:presigned_data['fields'][k] for k in presigned_data['fields']},
        'Content-Type' : content_type,
        'file': image_data
    })
    
    filter_ = {
        "_id": object_id,
    }

    update_ = {
        "$set": data,
        "$currentDate": {
            "updatedAt": True
        },
    }

    result = item_collection.find_one_and_update(filter=filter_, update=update_)

    if not result:
        raise HTTPException(status_code=400, detail="item is not found")

    return {'message': 'success'}
