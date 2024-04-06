import time
import pytest
from bs4 import BeautifulSoup
from unittest.mock import patch, MagicMock, mock_open
from src.alcampo.Alcampo_scrapper import (
    get_driver,
    scrap_image,
    generate_urls,
    save_product_to_json,
    scrap_one_product,
    scrap_alcampo_image,
    scrape_product_details,
    scrap_product_by_category,
    logger,
    timeit,
    lambda_handler,
)


sample_product = (
    {
        'name': 'PULEVA Bebida l\u00e1ctea con extractos vegetales y tript\u00f3fano, sin lactosa, Buenas Noches 1 l.',
        'image_url': 'https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/d43e2a3e-8d2e-4560-b865-44fdfe3350d1/300x300.jpg',
        'price_per_unit': '(1,50\u00a0\u20ac por litro)',
        'total_price': '1,50\u00a0\u20ac',
    },
)
mocked_image_url = 'https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/b2d25116-6a05-474a-8a2a-35011d8c99cb/300x300.jpg'


@patch('src.alcampo.Alcampo_scrapper.scrap_alcampo_image', return_value=mocked_image_url)
def test_scrap_image(mock_scrap_alcampo_image):
    """
    Test para verificar que la función scrap_image llama correctamente a scrap_alcampo_image
    con un producto específico y retorna la URL de la imagen mockeada esperada.

    Este test asegura que scrap_image actúa como un wrapper efectivo alrededor de scrap_alcampo_image,
    permitiendo una posible futura modificación de la implementación de extracción de imágenes
    sin cambiar la interfaz de scrap_image.

    Args:
        mock_scrap_alcampo_image (MagicMock): Un mock para scrap_alcampo_image, configurado
                                              para retornar una URL de imagen mockeada.
    """
    result = scrap_image(sample_product)
    mock_scrap_alcampo_image.assert_called_once_with(sample_product)
    assert result == mocked_image_url


@patch('src.alcampo.Alcampo_scrapper.os.getenv', return_value='production')
@patch('src.alcampo.Alcampo_scrapper.webdriver.Chrome')
def test_get_driver_production(mock_chrome, mock_getenv):
    """
    Test para verificar que get_driver configura correctamente una instancia de WebDriver de Chrome
    en un entorno de producción. Este test asegura que las configuraciones específicas para producción,
    como la ubicación del ejecutable del chromedriver y las opciones del navegador, sean aplicadas.

    Args:
        mock_chrome (MagicMock): Mock para el WebDriver de Chrome, permitiendo verificar la interacción sin iniciar un navegador real.
        mock_getenv (MagicMock): Mock para la función os.getenv, configurada para simular un entorno de producción.
    """
    driver = get_driver()
    mock_chrome.assert_called_once()


@patch('src.alcampo.Alcampo_scrapper.webdriver.Chrome')
@patch('src.alcampo.Alcampo_scrapper.ChromeOptions')
@patch('src.alcampo.Alcampo_scrapper.ChromeService')
def test_get_driver_headless_option(mock_chrome_service, mock_chrome_options, mock_chrome):
    """
    Test para verificar que la opción --headless se establece correctamente en ChromeOptions
    cuando se invoca get_driver. Asegura que el WebDriver de Chrome se inicializa con la
    configuración adecuada para ejecutar pruebas en un entorno sin cabeza (headless).

    Args:
        mock_chrome_service (MagicMock): Un mock para ChromeService.
        mock_chrome_options (MagicMock): Un mock para ChromeOptions.
        mock_chrome (MagicMock): Un mock para el WebDriver de Chrome.
    """
    driver = get_driver()

    # Verificar que add_argument fue llamado con '--headless'
    mock_chrome_options.return_value.add_argument.assert_any_call('--headless')


@pytest.mark.parametrize(
    'env_value, expected_path',
    [
        ('local', None),
        ('dev', '/opt/chromedriver'),
    ],
)
@patch('src.alcampo.Alcampo_scrapper.webdriver.Chrome')
def test_get_driver_service_path(mock_chrome, env_value, expected_path):
    """
    Test para verificar que el path del servicio del WebDriver de Chrome se configura
    correctamente basado en el valor de la variable de entorno 'ENVIRONMENT'. Este test
    asegura que el comportamiento de la función get_driver se ajusta a las expectativas
    para diferentes entornos de ejecución.

    Args:
        mock_chrome (MagicMock): Mock para el WebDriver de Chrome.
        env_value (str): El valor de la variable de entorno 'ENVIRONMENT' para el test.
        expected_path (str|None): El path esperado del chromedriver basado en 'env_value'.
    """
    with patch('src.alcampo.Alcampo_scrapper.os.getenv', return_value=env_value):
        get_driver()


@pytest.mark.parametrize(
    'names, base_url, expected',
    [
        (['bread', 'milk'], 'http://example.com/{name}', ['http://example.com/bread', 'http://example.com/milk']),
        ([], 'http://example.com/{name}', []),
    ],
)
def test_generate_urls(names, base_url, expected):
    """
    Test para verificar que generate_urls genera correctamente las URLs reemplazando el placeholder con cada nombre.
    """
    result = generate_urls(names, base_url)
    assert result == expected


@patch('builtins.open', new_callable=mock_open)
@patch('src.alcampo.Alcampo_scrapper.json.dump')
def test_save_new_product_to_nonexistent_file(mock_json_dump, mock_file_open):
    """
    Test unitario para la función save_product_to_json, verificando que se crea un nuevo archivo y se guarda el
    producto correctamente cuando el archivo no existe.

    Este test utiliza unittest.mock para simular la operación de apertura de archivo con mock_open y la función
    json.dump para verificar que el producto se escribe correctamente en un nuevo archivo. La simulación permite
    verificar el comportamiento esperado de save_product_to_json sin necesidad de crear, leer o escribir en un
    archivo real en el sistema de archivos, asegurando que el producto se guarde adecuadamente incluso cuando el
    archivo especificado inicialmente no existe.
    """
    product = {'name': 'Test Product', 'price': 19.99}
    save_product_to_json(product)
    mock_json_dump.assert_called_once_with([product], mock_file_open(), indent=4)


@pytest.fixture
def product_container():
    html_snippet = """
    <div>
        <h3 data-test="fop-title">
            CELTA Leche de vaca semidesnatada con bienestar animal garantizado 1.5 l.
        </h3>
        <img data-test="lazy-load-image" 
            src="https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/2d2908ae-a8d8-42da-b351-ea29a32f9653/500x500.jpg"/>
        <span data-test="fop-price-per-unit">(0,99 € por litro)</span>
        <span data-test="fop-price">1,49 €</span>
    </div>
    """
    return BeautifulSoup(html_snippet, 'html.parser').div


@pytest.fixture
def products_list():
    return []


@pytest.fixture
def scraped_names_set():
    return set()


def test_scrap_one_product(product_container, products_list, scraped_names_set):
    """
    Test para verificar que scrap_one_product extrae correctamente los detalles del producto
    desde un contenedor HTML y los agrega a la lista de productos si el nombre del producto
    aún no ha sido raspado.
    """
    with patch('src.alcampo.Alcampo_scrapper.scrap_image', return_value='mock_image_url'):
        scrap_one_product([], product_container, scraped_names_set, products_list)

        assert len(products_list) == 1
        product = products_list[0]

        assert product['name'] == 'CELTA Leche de vaca semidesnatada con bienestar animal garantizado 1.5 l.'
        assert (
            product['image_url']
            == 'https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/2d2908ae-a8d8-42da-b351-ea29a32f9653/500x500.jpg'
        )
        assert product['price_per_unit'] == '(0,99 € por litro)'
        assert product['total_price'] == '1,49 €'
        assert product['name'] in scraped_names_set


@patch('src.alcampo.Alcampo_scrapper.requests.get')
def test_scrap_alcampo_image_success(mock_requests_get):
    """
    Test para verificar que scrap_alcampo_image extrae correctamente la URL de la imagen de un producto
    desde una página web, dado una URL válida que contiene datos estructurados en formato JSON.
    """
    mock_response = MagicMock()
    mock_response.content = b"""
    <html>
        <head>
            <script type="application/ld+json">
                {"image": ["http://example.com/image.jpg"]}
            </script>
        </head>
    </html>
    """
    mock_requests_get.return_value = mock_response

    image_url = scrap_alcampo_image('http://example.com/product')

    assert image_url == 'http://example.com/image.jpg'


@patch('src.alcampo.Alcampo_scrapper.requests.get')
def test_scrap_alcampo_image_no_image_found(mock_requests_get):
    """
    Test para verificar que scrap_alcampo_image retorna None cuando no se puede encontrar la URL de la imagen
    del producto en los datos estructurados de la página.
    """
    mock_response = MagicMock()
    mock_response.content = b"""
    <html>
        <head>
            <script type="application/ld+json">
                {}
            </script>
        </head>
    </html>
    """
    mock_requests_get.return_value = mock_response
    image_url = scrap_alcampo_image('http://example.com/product')

    assert image_url is None


@patch('src.alcampo.Alcampo_scrapper.requests.get')
def test_scrap_alcampo_image_specific_product(mock_requests_get):
    """
    Test para verificar que scrap_alcampo_image extrae correctamente la URL de la imagen de un producto
    específico desde una página web, dado una URL válida que contiene datos estructurados en formato JSON.
    """
    mock_response = MagicMock()
    mock_response.content = b"""
    <html>
        <head>
            <script type="application/ld+json">
                {"image": ["https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/d43e2a3e-8d2e-4560-b865-44fdfe3350d1/300x300.jpg"]}
            </script>
        </head>
    </html>
    """
    mock_requests_get.return_value = mock_response
    product_page_url = 'https://www.compraonline.alcampo.es/producto/PULEVA-Bebida-lactea-con-extractos-vegetales-y-triptofano-sin-lactosa-Buenas-Noches-1-l/123456'
    image_url = scrap_alcampo_image(product_page_url)
    expected_image_url = 'https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/d43e2a3e-8d2e-4560-b865-44fdfe3350d1/300x300.jpg'
    assert image_url == expected_image_url


@patch('src.alcampo.Alcampo_scrapper.get_driver')
@patch('src.alcampo.Alcampo_scrapper.scrap_product_list')
@patch('src.alcampo.Alcampo_scrapper.logger')
def test_scrape_product_details(mock_logger, mock_scrap_product_list, mock_get_driver):
    """
    Test para verificar que scrape_product_details navega a una URL dada, extrae detalles de los productos
    presentes en la página usando Selenium y retorna una lista de diccionarios con esos detalles.
    """
    test_url = 'https://www.example.com/products'

    # Configurar mock_scrap_product_list para modificar la lista de productos directamente
    def side_effect_scrap_product_list(driver, products, scraped_names):
        products.extend([{'name': 'Producto 1', 'price': '10.99'}, {'name': 'Producto 2', 'price': '12.99'}])
        scraped_names.update({'Producto 1', 'Producto 2'})

    mock_scrap_product_list.side_effect = side_effect_scrap_product_list

    products = scrape_product_details(test_url)
    mock_get_driver.assert_called_once()
    mock_get_driver().get.assert_called_once_with(test_url)
    mock_scrap_product_list.assert_called_once()
    mock_get_driver().quit.assert_called_once()

    assert len(products) == 2
    assert products[0]['name'] == 'Producto 1'
    assert products[1]['name'] == 'Producto 2'


@patch('src.alcampo.Alcampo_scrapper.save_product_to_json')
@patch('src.alcampo.Alcampo_scrapper.scrape_product_details')
def test_scrap_product_by_category_success(mock_scrape_product_details, mock_save_product_to_json):
    test_url = 'http://example.com/category'
    mock_products = [{'name': 'Producto 1', 'price': '10.99'}, {'name': 'Producto 2', 'price': '12.99'}]
    mock_scrape_product_details.return_value = mock_products
    result = scrap_product_by_category(test_url)
    mock_scrape_product_details.assert_called_once_with(test_url)

    assert mock_save_product_to_json.call_count == len(mock_products)
    for product in mock_products:
        mock_save_product_to_json.assert_any_call(product)
    assert result == mock_products


@patch('src.alcampo.Alcampo_scrapper.scrape_product_details')
def test_scrap_product_by_category_exception(mock_scrape_product_details):
    mock_scrape_product_details.side_effect = Exception('Error de prueba')
    test_url = 'http://example.com/category'

    with patch.object(logger, 'exception') as mock_logger_exception:
        result = scrap_product_by_category(test_url)
        mock_logger_exception.assert_called()
        assert result is None


@patch('src.alcampo.Alcampo_scrapper.scrape_product_details', return_value=None)
def test_scrap_product_by_category_no_products(mock_scrape_product_details):
    test_url = 'http://example.com/category'

    with patch.object(logger, 'error') as mock_logger_error:
        result = scrap_product_by_category(test_url)
        mock_logger_error.assert_called_once_with(f'Datos no válidos para la URL {test_url}, omitiendo...')
        assert result is None


def dummy_function(sleep_time=0.1, *args, **kwargs):
    """Una función de ejemplo que simplemente espera un tiempo."""
    time.sleep(sleep_time)
    return 'Resultado'


@patch('src.alcampo.Alcampo_scrapper.logger.info')
def test_timeit_decorator(mock_logger_info):
    """
    Test para verificar que el decorador 'timeit' mide correctamente el tiempo de ejecución
    de la función decorada y registra este tiempo utilizando el logger.
    """
    decorated_dummy_function = timeit(dummy_function)
    result = decorated_dummy_function(sleep_time=0.1)
    assert result == 'Resultado'
    mock_logger_info.assert_called_once()
    args, kwargs = mock_logger_info.call_args
    assert 'dummy_function took' in args[0]
    assert 'seconds to run.' in args[0]


mock_products = [{'name': 'Leche Puleva', 'price': '1.20€'}, {'name': 'Leche Asturiana', 'price': '1.30€'}]


@patch('src.alcampo.Alcampo_scrapper.scrape_product_details', return_value=mock_products)
@patch(
    'src.alcampo.Alcampo_scrapper.generate_urls', return_value=['https://www.compraonline.alcampo.es/search?q=leche']
)
def test_lambda_handler(mock_generate_urls, mock_scrape_product_details):
    """
    Test para verificar que la función lambda_handler genera correctamente URLs basadas en una lista de nombres,
    raspa los detalles de los productos de cada URL generada y compila todos los productos encontrados en una lista.
    """

    result = lambda_handler()
    mock_generate_urls.assert_called_once_with(
        names=['leche'], base_url='https://www.compraonline.alcampo.es/search?q={name}'
    )
    mock_scrape_product_details.assert_called_once_with('https://www.compraonline.alcampo.es/search?q=leche')
    assert result == mock_products
