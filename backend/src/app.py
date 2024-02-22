import os
import json
from flask import Flask, request
from bson import json_util, ObjectId
from pymongo import MongoClient

app = Flask(__name__)

uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client['webapp']

def parse_json(data):
    return json.loads(json_util.dumps(data))

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/items', methods=['GET'])
def get_all_items():
    items = list(client.webapp.items.find())
    return parse_json(items), 200

@app.route('/items', methods=['POST'])
def create_item():
    item = request.get_json()
    inserted_item = client.db.items.insert_one(item)
    return parse_json(inserted_item.inserted_id), 201

@app.route('/items/<item_id>', methods=['GET'])
def get_item(item_id):
    item = client.db.items.find_one_or_404({'_id': ObjectId(item_id)})
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
