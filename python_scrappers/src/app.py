import os
import json
from flask import Flask, Response, request, jsonify, abort
from bson import json_util, ObjectId
from flask_cors import cross_origin
import logging
import re
from flask_cors import CORS
import requests
import awsgi
import boto3
from boto3.dynamodb.conditions import Key, Attr
import unicodedata
import urllib.parse
from botocore.exceptions import ClientError
from statsmodels.tsa.arima_model import ARIMA
import pandas as pd
import pmdarima as pm
import pickle

app = Flask(__name__)
CORS(app)


dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
table = dynamodb.Table('ScrappedProductsTable')
dynamodb_client = boto3.client('dynamodb')

cognito_client = boto3.client('cognito-idp', region_name='eu-west-1')
USER_POOL_ID = 'eu-west-1_nRtCoCYik'

logger = logging.getLogger()
logging.basicConfig(filename='app.log', level=logging.DEBUG)



class Modelo:

    def predict(self, prices):
        model = pm.auto_arima(
            prices,
            start_p=1, start_q=1,
            test='adf',
            max_p=3, max_q=3,
            m=1,
            d=None,
            seasonal=False,
            start_P=0,
            D=0,
            trace=True,
            error_action='ignore',
            suppress_warnings=True,
            stepwise=True)
        forecast, conf_int = model.predict(n_periods=30, return_conf_int=True)
        return forecast, conf_int

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    prices = data['prices']
    modelo = Modelo()
    forecast, conf_int = modelo.predict(prices)
    return jsonify({'forecast': forecast.tolist(), 'conf_int': conf_int.tolist()})

########################################################################

def is_admin(email):
    response = cognito_client.admin_list_groups_for_user(
        UserPoolId=USER_POOL_ID,
        Username=email
    )
    groups = [group['GroupName'] for group in response['Groups']]
    return 'Admin' in groups

@app.route('/users', methods=['GET'])
def list_users():
    email = request.args.get('email')
    if not email or not is_admin(email):
        return jsonify({'error': 'Unauthorized'}), 403

    response = cognito_client.list_users(UserPoolId=USER_POOL_ID)
    users = []
    for user in response['Users']:
        user_attributes = {attr['Name']: attr['Value'] for attr in user['Attributes']}
        users.append({
            'Email': user_attributes.get('email', ''),
            'Username': user_attributes.get('preferred_username', user['Username'])
        })
    return jsonify(users)

@app.route('/users/<email>/groups', methods=['GET'])
def list_user_groups(email):
    admin_email = request.args.get('admin_email')
    if not admin_email or not is_admin(admin_email):
        return jsonify({'error': 'Unauthorized'}), 403

    response = cognito_client.admin_list_groups_for_user(
        UserPoolId=USER_POOL_ID,
        Username=email
    )
    groups = [group['GroupName'] for group in response['Groups']]
    return jsonify({'groups': groups})

@app.route('/users/add-to-group', methods=['POST'])
def add_user_to_group():
    admin_email = request.json.get('admin_email')
    if not admin_email or not is_admin(admin_email):
        return jsonify({'error': 'Unauthorized'}), 403

    email = request.json['email']
    group_name = request.json['groupName']
    
    cognito_client.admin_add_user_to_group(
        UserPoolId=USER_POOL_ID,
        Username=email,
        GroupName=group_name
    )
    
    return jsonify({'message': f'User {email} added to group {group_name}'})

@app.route('/users/remove-from-group', methods=['POST'])
def remove_user_from_group():
    admin_email = request.json.get('admin_email')
    if not admin_email or not is_admin(admin_email):
        return jsonify({'error': 'Unauthorized'}), 403

    email = request.json['email']
    group_name = request.json['groupName']
    
    cognito_client.admin_remove_user_from_group(
        UserPoolId=USER_POOL_ID,
        Username=email,
        GroupName=group_name
    )
    
    return jsonify({'message': f'User {email} removed from group {group_name}'})

########################################################################

def normalize_query(query):
    return query.strip().lower()

@app.route('/items', methods=['GET'])
def get_all_items():
    limit = int(request.args.get('limit', 48))
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
        for item in items:
            if 'price_history' not in item:
                item['price_history'] = []
        return jsonify({
            'items': items,
            'lastEvaluatedKey': last_evaluated_key,
            'totalPages': total_pages,
        }), 200
    except Exception as e:
        app.logger.error(f"Error retrieving items: {str(e)}")
        app.logger.error(f"Scan kwargs: {scan_kwargs}")
        return jsonify({'error': str(e)}), 500

@app.route('/item/name/<string:pname>', methods=['GET'])
def get_item_by_pname(pname):
    try:
        # Decodificar URL
        pname_decoded = urllib.parse.unquote(pname)
        # Normalizar
        pname_normalized = normalize_query(pname_decoded)
        
        logger.debug(f"Normalized pname: {pname_normalized}")
        
        response = table.query(
            IndexName='NameIndex',
            KeyConditionExpression=Key('pname').eq(pname_normalized),
            ProjectionExpression='#ts, origin',
            ExpressionAttributeNames={
                '#ts': 'timestamp'
            }
        )
        
        logger.debug(f"Query response: {response}")
        
        if 'Items' in response and response['Items']:
            item_key = {
                'origin': response['Items'][0]['origin'],
                'timestamp': int(response['Items'][0]['timestamp'])
            }

            full_item_response = table.get_item(
                Key=item_key
            )
            
            logger.debug(f"Full item response: {full_item_response}")
            
            if 'Item' in full_item_response:
                item = full_item_response['Item']
                return jsonify(item), 200
            else:
                return jsonify({'error': 'Item no encontrado'}), 404
        else:
            return jsonify({'error': 'Item no encontrado'}), 404
    
    except Exception as e:
        logger.error(f"Error al buscar el item: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/item/name/<string:pname>', methods=['DELETE']) 
def delete_item(pname):
    try:
        # Decodificar URL
        pname_decoded = urllib.parse.unquote(pname)
        # Normalizar
        pname_normalized = normalize_query(pname_decoded)
        app.logger.debug(f"Decoded pname: {pname_decoded}")
        app.logger.debug(f"Normalized pname: {pname_normalized}")
        
        response = table.delete_item(Key={'pname': pname_normalized})
        
        app.logger.debug(f"Delete response: {response}")
        
        return jsonify({'message': 'Item borrado correctamente'}), 200
    except ClientError as e:
        app.logger.error(f"ClientError: {e.response['Error']['Message']}")
        return jsonify({'error': e.response['Error']['Message']}), 500
    except Exception as e:
        app.logger.error(f"Exception: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/search/<search_query>', methods=['GET'])
def search_items(search_query):
    search_query = urllib.parse.unquote(search_query)
    final_query = normalize_query(search_query)
    next_token = request.args.get('next_token', None)
    limit = 48  
    page_limit = 48
    accumulated_items = []
    query = f"SELECT * FROM \"ScrappedProductsTable\".\"NameIndex\" WHERE contains(pname, '{final_query}')"
    app.logger.debug(f"Decoded start_key: {search_query}")

    while len(accumulated_items) < limit:
        params = {
            'Statement': query,
            'Limit': page_limit
        }

        if next_token and next_token != 'null':
            params['NextToken'] = next_token

        try:
            response = dynamodb_client.execute_statement(**params)
            items = response.get('Items', [])
            next_token = response.get('NextToken', None)
            
            accumulated_items.extend(items)

            if not next_token:
                break  
        
        except Exception as e:
            app.logger.error(f"Error retrieving items: {str(e)}")
            return jsonify({'error': str(e)}), 500


    limited_items = accumulated_items[:limit]

    formatted_items = [
        {
            'pname': item.get('pname', {}).get('S', ''),
            'price_per_unit': item.get('price_per_unit', {}).get('S', ''),
            'total_price': item.get('total_price', {}).get('S', ''),
            'image_url': item.get('image_url', {}).get('S', ''),
            'timestamp': item.get('timestamp', {}).get('N', ''),
            'origin': item.get('origin', {}).get('S', '')
        } 
        for item in limited_items
    ]
    
    return jsonify({
        'items': formatted_items,
        'next_token': next_token if len(accumulated_items) >= limit else None
    }), 200

################################################################

@app.route('/')
@cross_origin(origin='localhost')
def hello_world():
    return 'Hello, World from /!'


@app.route('/hello')
@cross_origin(origin='*')
def hello_world_V2():
    return 'Hello, World! from /hello'

################################################################

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
                'message': 'Scraping alcampo iniciado y datos enviados al servicio de carga.',
                # 'data': all_products,
            }
        ), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scrape/dia', methods=['POST'])
@cross_origin(origin='localhost')
def start_scraping_dia():
    data = request.get_json()
    terms = data.get('terms', [])
    if not terms:
        return jsonify({'error': 'No se proporcionaron términos para el scraping.'}), 400

    sqs = boto3.client('sqs')

    # URL de la cola de SQS
    queue_url = 'https://sqs.eu-west-1.amazonaws.com/590183922248/MiColaSQS'

    # Mensaje a enviar
    message = {
        "scrapper": "dia",
        "terms": terms
    }

    # Envía el mensaje a SQS
    response = sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(message)
    )

    try:
        return jsonify(
            {
                'message': 'Scraping dia iniciado y datos enviados al servicio de carga.',
            }
        ), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)


def lambda_handler(event, context):
    print(event)
    print(context)
    return awsgi.response(app, event, context, base64_content_types={'image/png'})
