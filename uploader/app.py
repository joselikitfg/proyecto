import os
import json
from flask import Flask, Response, request, jsonify, abort
from bson import json_util, ObjectId
from flask_cors import cross_origin
from pymongo import MongoClient
import logging
import re
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)


gunicorn_logger = logging.getLogger('gunicorn.error')
gunicorn_logger.setLevel(logging.DEBUG)
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(gunicorn_logger.level)


uri = os.getenv('MONGO_URI')
client = MongoClient(uri)
db = client['webapp']


@app.route('/')
@cross_origin(origin='localhost')
def hello_world():
    return 'Helloaaa, World!'

@app.route('/items', methods=['GET'])
@cross_origin(origin='localhost')
def get_all_items():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 60))
    skip = (page - 1) * limit
    total_items = client.webapp.items.count_documents({})
    total_pages = (total_items + limit - 1) // limit

    items = client.webapp.items.find().skip(skip).limit(limit)
    items_list = list(items)


    response = {
        'items': items_list,
        'totalPages': total_pages,
    }

    return Response(json.dumps(response, default=json_util.default), mimetype='application/json')

@app.route('/api/scraped-items', methods=['POST'])
@cross_origin(origin='localhost')
def upload_scraped_items():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Solicitud invalida, se esperaba JSON'}), 400


    result = db.items.insert_many(data)
    inserted_count = len(result.inserted_ids)
    return jsonify({'message': f'{inserted_count} items insertados correctamente'}), 201
