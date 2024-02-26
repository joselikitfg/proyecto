import os
import json
from flask import Flask, Response, request
from bson import json_util, ObjectId
from flask_cors import cross_origin
from pymongo import MongoClient
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['DEBUG'] = True
app.config['PROPAGATE_EXCEPTIONS'] = True

gunicorn_logger = logging.getLogger('gunicorn.error')
gunicorn_logger.setLevel(logging.DEBUG) 
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(gunicorn_logger.level)

uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client['webapp']

def parse_json(data):
    return json.loads(json_util.dumps(data))

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/items', methods=['GET'])
@cross_origin(origin='localhost')
def get_all_items():
    items = list(client.webapp.items.find())
    items_json = json.dumps(items, default=json_util.default)
    return Response(response=items_json, status=200, mimetype="application/json")

@app.route('/items', methods=['POST'])
@cross_origin(origin='localhost')
def create_item():
    item = request.get_json()
    inserted_item = client.webapp.items.insert_one(item)
    return parse_json(inserted_item.inserted_id), 201

@app.route('/items/<item_id>', methods=['GET'])
def get_item(item_id):
    item = client.db.items.find_one_or_404({'_id': ObjectIdpython(item_id)})
    return parse_json(item), 200

@app.route('/items/<item_id>', methods=['PUT'])
def update_item(item_id):
    item = request.get_json()
    item_id_obj = ObjectId(item_id)
    result = client.db.items.update_one({'_id': item_id_obj}, {'$set': item})
    if result.matched_count == 0:
        return parse_json({'error': 'Item not found'}), 404
    updated_item = client.db.items.find_one({'_id': item_id_obj})
    return parse_json({'message': 'Item updated successfully', 'item': updated_item}), 200

@app.route('/items/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    item_id_obj = ObjectId(item_id)
    result = client.db.items.delete_one({'_id': item_id_obj})
    if result.deleted_count == 0:
        return parse_json({'error': 'Item not found'}), 404
    return parse_json({'message': 'Item deleted successfully'}), 200

if __name__ == "__main__":
    app.run(debug=True)
