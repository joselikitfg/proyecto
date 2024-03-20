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
from Alcampo_scrapper import scrape_product_details, generate_urls, save_product_to_json
app = Flask(__name__)
CORS(app)


gunicorn_logger = logging.getLogger('gunicorn.error')
gunicorn_logger.setLevel(logging.DEBUG) 
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(gunicorn_logger.level)


uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client['webapp']


@app.route('/')
@cross_origin(origin='localhost')
def hello_world():
    return 'Hello, World!'



@app.route('/scrape', methods=['POST'])
@cross_origin(origin='localhost')
def start_scraping():

    if not request.json or 'terms' not in request.json:
        abort(400)  
    
    terms = request.json['terms']

    if not isinstance(terms, list):
        abort(400)  
    
    results = []  
    for term in terms:
        url_base = 'https://www.compraonline.alcampo.es/search?q={name}'
        generated_url = url_base.format(name=term)  
        
        
        try:
            products = scrape_product_details(generated_url)
            for product in products:
                save_product_to_json(product)  
            results.append({term: products})  
        except Exception as e:
            app.logger.error(f"Error al procesar el término '{term}': {e}")
    

    return jsonify({'message': 'Scraping completado', 'results': results}), 200

if __name__ == "__main__":
    app.run(debug=True)