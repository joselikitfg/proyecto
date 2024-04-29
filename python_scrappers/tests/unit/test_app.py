import pytest
from src.app import app as flask_app, lambda_handler
from unittest.mock import patch

@pytest.fixture
def app():
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('src.app.generate_urls')
@patch('src.app.scrape_product_details')
def test_start_scraping_alcampo(mock_scrape_product_details, mock_generate_urls, client):
    mock_generate_urls.return_value = ['https://www.compraonline.alcampo.es/search?q=leche']
    mock_scrape_product_details.return_value = [{'name': 'Leche', 'price': '1€'}]

    response = client.post('/scrape/alcampo', json={'terms': ['leche']})
    data = response.get_json()

    assert response.status_code == 200
    assert 'message' in data
    assert len(data['data']) == 1
    assert data['data'][0]['name'] == 'Leche'



# Simulación de un evento y contexto de AWS Lambda
mock_event = {
    'httpMethod': 'GET',
    'path': '/',
    'headers': {},
    'queryStringParameters': {},
    'body': None,
    'isBase64Encoded': False,
}
mock_context = {}

@patch('src.app.awsgi.response')
def test_lambda_handler(mock_awsgi_response):
    """
    Test para verificar que lambda_handler maneja correctamente eventos y contextos de AWS Lambda,
    utilizando awsgi para adaptar la respuesta de una aplicación Flask.
    """
    mock_response = {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/html'},
        'body': 'Hello, World from /!',
        'isBase64Encoded': False,
    }
    mock_awsgi_response.return_value = mock_response
    response = lambda_handler(mock_event, mock_context)
    mock_awsgi_response.assert_called_once()
    assert response == mock_response
