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

app.config['DEBUG'] = True
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['UPLOAD_FOLDER'] = '/tmp'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

ALLOWED_EXTENSIONS = {'json'}

gunicorn_logger = logging.getLogger('gunicorn.error')
gunicorn_logger.setLevel(logging.DEBUG)
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(gunicorn_logger.level)

uri = os.getenv('MONGO_URI')
client = MongoClient(uri)
db = client['webapp']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
@cross_origin(origin='localhost')
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        with open(filepath, 'r') as json_file:
            data = json.load(json_file)
            result = db.items.insert_many(data)
            inserted_count = len(result.inserted_ids)
        os.remove(filepath)
        return jsonify({'message': f'{inserted_count} ítems insertados correctamente'}), 201
    else:
        return jsonify({'error': 'Tipo de archivo no permitido'}), 400



def parse_json(data):
    return json.loads(json_util.dumps(data))


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


@app.route('/items', methods=['POST'])
@cross_origin(origin='localhost')
def create_item():
    item = request.get_json()
    name = item.get('name', '')
    image_url = item.get('image_url', '')
    price_per_unit = item.get('price_per_unit', '')
    total_price = item.get('total_price', '')


    if not (name.strip() and image_url.strip() and price_per_unit.strip() and total_price.strip()):
        return jsonify({'error': 'Todos los campos (nombre, URL de la imagen, precio por unidad, precio total) son obligatorios'}), 400


    if not re.search(r'\.(jpg|jpeg|png|gif)$', image_url, re.IGNORECASE):
        return jsonify({'error': 'La URL de la imagen debe terminar con un formato válido (.jpg, .jpeg, .png, .gif)'}), 400



    inserted_item = client.webapp.items.insert_one(item)
    return parse_json(inserted_item.inserted_id), 201


@app.route('/items/<item_id>', methods=['GET'])
@cross_origin(origin='localhost')
def get_item(item_id):
    try:
        item = client.webapp.items.find_one({'_id': ObjectId(item_id)})
        if item:
            return jsonify(parse_json(item)), 200
        else:
            abort(404, price='Item not found')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/search')
@cross_origin(origin='localhost')
def search():
    query = request.args.get('q')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit

    total_items = db.items.count_documents({'name': {'$regex': query, '$options': 'i'}})
    total_pages = (total_items + limit - 1) // limit
    items = db.items.find({'name': {'$regex': query, '$options': 'i'}}).skip(skip).limit(limit)

    response = {
        'items': list(items),
        'totalPages': total_pages,
    }
    return Response(json.dumps(response, default=json_util.default), mimetype='application/json')


@app.route('/items/<item_id>', methods=['DELETE'])
@cross_origin(origin='localhost')
def delete_item(item_id):
    try:
        item_id_obj = ObjectId(item_id)
    except Exception as e:
        return parse_json({'error': 'Invalid item ID format'}), 400

    result = client.webapp.items.delete_one({'_id': item_id_obj})
    if result.deleted_count == 0:
        return parse_json({'error': 'Item not found'}), 404
    return parse_json({'message': 'Item deleted successfully'}), 200

@app.route('/items/<item_id>', methods=['PUT'])
def update_item(item_id):
    item = request.get_json()
    item_id_obj = ObjectId(item_id)
    result = client.db.items.update_one({'_id': item_id_obj}, {'$set': item})
    if result.matched_count == 0:
        return parse_json({'error': 'Item not found'}), 404
    updated_item = client.db.items.find_one({'_id': item_id_obj})
    return parse_json({'message': 'Item updated successfully', 'item': updated_item}), 200
if __name__ == '__main__':
    app.run(debug=True)
