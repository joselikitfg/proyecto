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
from .alcampo.Alcampo_scrapper import scrape_product_details, generate_urls, save_product_to_json
from .hipercor.Hipercor_scrapper import scrap_product_by_category
import requests
import awsgi
import boto3
from boto3.dynamodb.conditions import Key, Attr
import unicodedata
app = Flask(__name__)
CORS(app)


dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
table = dynamodb.Table('ScrappedProductsTable')

gunicorn_logger = logging.getLogger('gunicorn.error')
gunicorn_logger.setLevel(logging.DEBUG)
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(gunicorn_logger.level)


uri = os.getenv('MONGO_URI')
client = MongoClient(uri)
db = client['webapp']

def normalize_query(input_string):
    """Normalize and lowercase the input string."""
    return unicodedata.normalize('NFKD', input_string).encode('ASCII', 'ignore').decode('ASCII').lower()

@app.route('/items', methods=['GET'])
def get_all_items():
    limit = int(request.args.get('limit', 12))
    start_key = request.args.get('start_key', None)

    scan_kwargs = {'Limit': limit}

    if start_key and start_key != 'null':
        try:
            decoded_key = json.loads(start_key)
            app.logger.debug(f"Decoded start_key: {decoded_key}")
            if isinstance(decoded_key, dict):
                decoded_key['timestamp'] = int(decoded_key['timestamp'])
                scan_kwargs['ExclusiveStartKey'] = decoded_key
            else:
                raise ValueError("start_key must be a dictionary.")
        except (json.JSONDecodeError, ValueError) as e:
            app.logger.error(f"Invalid start_key: {start_key}, error: {str(e)}")
            return jsonify({'error': 'Invalid start_key parameter'}), 400

    try:
        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])
        last_evaluated_key = response.get('LastEvaluatedKey', None)

        response_count = table.scan(Select='COUNT')
        total_items = response_count.get('Count', 0)
        total_pages = (total_items + limit - 1) // limit

        return jsonify({
            'items': items,
            'lastEvaluatedKey': last_evaluated_key,
            'totalPages': total_pages,
        }), 200
    except Exception as e:
        app.logger.error(f"Error retrieving items: {str(e)}")
        app.logger.error(f"Scan kwargs: {scan_kwargs}")
        return jsonify({'error': str(e)}), 500

@app.route('/items/<item_id>', methods=['GET'])
def get_item(item_id):
    try:
        response = table.get_item(Key={'pname': item_id})
        item = response.get('Item', None)
        if item:
            return jsonify(item), 200
        else:
            return jsonify({'error': 'Item no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search', methods=['GET'])
@cross_origin(origin='localhost')
def search():
    raw_query = request.args.get('q', '')
    query = normalize_query(raw_query)
    limit = int(request.args.get('limit', 12))
    start_key = request.args.get('start_key', None)

    app.logger.debug(f"Searching for: '{query}' with limit {limit} and start_key {start_key}")

    filter_expression = Attr('pname').contains(query)
    scan_kwargs = {
        'FilterExpression': filter_expression,
        'Limit': limit,
    }

    if start_key and start_key != 'null':
        try:
            decoded_key = json.loads(start_key)
            app.logger.debug(f"Decoded start_key: {decoded_key}")
            if isinstance(decoded_key, dict):
                decoded_key['timestamp'] = int(decoded_key['timestamp'])
                scan_kwargs['ExclusiveStartKey'] = decoded_key
            else:
                raise ValueError("start_key must be a dictionary.")
        except (json.JSONDecodeError, ValueError) as e:
            app.logger.error(f"Invalid start_key: {start_key}, error: {str(e)}")
            return jsonify({'error': 'Invalid start_key parameter'}), 400

    try:
        response = table.scan(**scan_kwargs)
        app.logger.debug(f"DynamoDB response: {response}")

        items = response.get('Items', [])
        last_evaluated_key = response.get('LastEvaluatedKey', None)

        response_count = table.scan(
            FilterExpression=filter_expression,
            Select='COUNT'
        )
        total_items = response_count.get('Count', 0)
        total_pages = (total_items + limit - 1) // limit

        return jsonify({
            'items': items,
            'lastEvaluatedKey': last_evaluated_key,
            'totalPages': total_pages,
        }), 200
    except Exception as e:
        app.logger.error(f"Error retrieving items: {str(e)}")
        app.logger.error(f"Scan kwargs: {scan_kwargs}")
        return jsonify({'error': str(e)}), 500

@app.route('/items/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        response = table.delete_item(Key={'pname': item_id})
        return jsonify({'message': 'Item borrado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
@cross_origin(origin='localhost')
def hello_world():
    return 'Hello, World from /!'


@app.route('/hello')
@cross_origin(origin='*')
def hello_world_V2():
    return 'Hello, World! from /hello'


@app.route('/scrape/alcampo', methods=['POST'])
@cross_origin(origin='localhost')
def start_scraping_alcampo():
    data = request.get_json()
    terms = data.get('terms', [])
    if not terms:
        return jsonify({'error': 'No se proporcionaron términos para el scraping.'}), 400

    sqs = boto3.client('sqs')

    # URL de la cola de SQS
    queue_url = 'https://sqs.eu-west-1.amazonaws.com/590183922248/MiColaSQS'

    # Mensaje a enviar
    message = {
        "scrapper": "alcampo",
        "terms": terms
    }

    # Envía el mensaje a SQS
    response = sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(message)
    )

    # url_base = 'https://www.compraonline.alcampo.es/search?q={name}'
    # generated_urls = generate_urls(terms, url_base)
    # all_products = []

    # for url in generated_urls:
    #     products = scrape_product_details(url)
    #     all_products.extend(products)

    try:
        # send_scraped_data_to_uploader(all_products)
        return jsonify(
            {
                'message': 'Scraping iniciado y datos enviados al servicio de carga.',
                # 'data': all_products,
            }
        ), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# @app.route('/scrape/hipercor', methods=['POST'])
# @cross_origin(origin='localhost')
# def start_scraping_hipercor():
#     data = request.get_json()
#     terms = data.get('terms', [])
#     if not terms:
#         return jsonify({'error': 'No se proporcionaron términos para el scraping.'}), 400

#     url_base = 'https://www.hipercor.es/supermercado/buscar/'
#     generated_urls = generate_urls_h(url_base, terms)
#     all_products = []

#     for url in generated_urls:
#         products = scrap_product_by_category(url, terms[generated_urls.index(url)], url_base)
#         if products:
#             all_products.extend(products)

#     try:
#         # send_scraped_data_to_uploader(all_products)
#         return jsonify({'message': 'Scraping iniciado y datos enviados al servicio de carga.'}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500


@cross_origin(origin='localhost')
def send_scraped_data_to_uploader(data):
    url = 'http://uploader:8094/api/scraped-items'
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 201:
        print('Datos enviados exitosamente al servicio de carga.')
    else:
        print('Error al enviar datos al servicio de carga:', response.text)


if __name__ == '__main__':
    app.run(debug=True)


def lambda_handler(event, context):
    print(event)
    print(context)
    return awsgi.response(app, event, context, base64_content_types={'image/png'})
