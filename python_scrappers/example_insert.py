import boto3

# Configuración del cliente de DynamoDB
dynamodb = boto3.resource('dynamodb')

# Nombre de la tabla DynamoDB
table_name = 'ScrappedProducts'

# Referencia a la tabla
table = dynamodb.Table(table_name)

# Datos a insertar
items = [
    {
        "scrapped_timestamp": 1713111021,
        "name": "PULEVA Leche semidesnatada ecológica de vaca, sin lactosa ECO 1 l.",
        "image_url": "https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/36230af1-8c97-4034-acc5-4ef510f2dff8/500x500.jpg",
        "price_per_unit": "1,66 € por litro",
        "total_price": "1,66 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1714111022,
        "name": "DANONE Yogur natural sin azúcar, pack de 6 x 125 g.",
        "image_url": "https://example.com/image-yogur-danone.jpg",
        "price_per_unit": "0,30 € por unidad",
        "total_price": "1,80 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1714111023,
        "name": "BIMBO Pan de molde integral sin corteza, paquete 450 g.",
        "image_url": "https://example.com/image-pan-bimbo.jpg",
        "price_per_unit": "0,22 € por 100 g",
        "total_price": "0,99 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1714111024,
        "name": "COLGATE Pasta de dientes Max White, tubo 75 ml.",
        "image_url": "https://example.com/image-pasta-colgate.jpg",
        "price_per_unit": "3,20 € por tubo",
        "total_price": "3,20 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1714111025,
        "name": "LA RIOJA ALTA Vino tinto reserva 2015, botella 750 ml.",
        "image_url": "https://example.com/image-vino-rioja.jpg",
        "price_per_unit": "10,00 € por botella",
        "total_price": "10,00 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1714111026,
        "name": "KELLOGG'S Cereal Corn Flakes, caja 500 g.",
        "image_url": "https://example.com/image-cereal-kelloggs.jpg",
        "price_per_unit": "0,50 € por 100 g",
        "total_price": "2,50 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1715111027,
        "name": "NESCAFÉ Café instantáneo Clásico, frasco 100 g.",
        "image_url": "https://example.com/image-cafe-nescafe.jpg",
        "price_per_unit": "3,50 € por 100 g",
        "total_price": "3,50 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1715111028,
        "name": "FAIRY Detergente líquido para platos, botella 820 ml.",
        "image_url": "https://example.com/image-detergente-fairy.jpg",
        "price_per_unit": "2,80 € por botella",
        "total_price": "2,80 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1715111029,
        "name": "GALLO Espaguetis nº3, paquete 500 g.",
        "image_url": "https://example.com/image-espaguetis-gallo.jpg",
        "price_per_unit": "1,00 € por paquete",
        "total_price": "1,00 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1715111030,
        "name": "ACTIMEL Probiótico natural, pack de 6 x 100 g.",
        "image_url": "https://example.com/image-actimel.jpg",
        "price_per_unit": "0,30 € por unidad",
        "total_price": "1,80 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1715111031,
        "name": "HEINEKEN Cerveza, pack de 12 latas x 330 ml.",
        "image_url": "https://example.com/image-cerveza-heineken.jpg",
        "price_per_unit": "0,75 € por lata",
        "total_price": "9,00 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1715111032,
        "name": "FINDUS Verduras para paella, bolsa congelada 600 g.",
        "image_url": "https://example.com/image-verduras-findus.jpg",
        "price_per_unit": "3,50 € por bolsa",
        "total_price": "3,50 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1715111033,
        "name": "ORAL-B Cabezales de recambio para cepillo eléctrico, pack de 4.",
        "image_url": "https://example.com/image-cabezales-oralb.jpg",
        "price_per_unit": "10,00 € por pack",
        "total_price": "10,00 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1715111034,
        "name": "DODOT Pañales talla 4, pack de 64 unidades.",
        "image_url": "https://example.com/image-panales-dodot.jpg",
        "price_per_unit": "0,25 € por pañal",
        "total_price": "16,00 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1715111035,
        "name": "OIKOS Yogur griego natural, pack de 4 x 110 g.",
        "image_url": "https://example.com/image-yogur-oikos.jpg",
        "price_per_unit": "0,87 € por unidad",
        "total_price": "3,48 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1715111036,
        "name": "AVECREM Caldo de pollo, cubos 100 g.",
        "image_url": "https://example.com/image-caldo-avecrem.jpg",
        "price_per_unit": "1,50 € por 100 g",
        "total_price": "1,50 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1716111037,
        "name": "BONDUUELLE Guisantes muy finos, lata 400 g.",
        "image_url": "https://example.com/image-guisantes-bonduelle.jpg",
        "price_per_unit": "0,90 € por lata",
        "total_price": "0,90 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1716111038,
        "name": "RON BRUGAL Añejo, botella 700 ml.",
        "image_url": "https://example.com/image-ron-brugal.jpg",
        "price_per_unit": "15,00 € por botella",
        "total_price": "15,00 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1716111039,
        "name": "KELLOGG'S Froot Loops, caja 375 g.",
        "image_url": "https://example.com/image-froot-loops.jpg",
        "price_per_unit": "2,70 € por caja",
        "total_price": "2,70 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1716111040,
        "name": "L'ORÉAL Champú revitalizante, botella 250 ml.",
        "image_url": "https://example.com/image-champu-loreal.jpg",
        "price_per_unit": "3,50 € por botella",
        "total_price": "3,50 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1716111041,
        "name": "REGILAIT Leche en polvo, bolsa 400 g.",
        "image_url": "https://example.com/image-leche-regilait.jpg",
        "price_per_unit": "4,00 € por bolsa",
        "total_price": "4,00 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1716111042,
        "name": "ROYAL Galletas Oreo, paquete 154 g.",
        "image_url": "https://example.com/image-oreo-royal.jpg",
        "price_per_unit": "1,20 € por paquete",
        "total_price": "1,20 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1716111043,
        "name": "NESTLÉ Chocolate KitKat, pack de 4 barras.",
        "image_url": "https://example.com/image-kitkat-nestle.jpg",
        "price_per_unit": "2,00 € por pack",
        "total_price": "2,00 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1716111044,
        "name": "SCOTTEX Papel higiénico, pack de 12 rollos.",
        "image_url": "https://example.com/image-papel-scottex.jpg",
        "price_per_unit": "4,50 € por pack",
        "total_price": "4,50 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1716111045,
        "name": "CAMPBELL'S Sopa de tomate, lata 305 g.",
        "image_url": "https://example.com/image-sopa-campbells.jpg",
        "price_per_unit": "2,50 € por lata",
        "total_price": "2,50 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1716111046,
        "name": "TRESemmé Acondicionador hidratante, botella 700 ml.",
        "image_url": "https://example.com/image-acondicionador-tresemme.jpg",
        "price_per_unit": "5,00 € por botella",
        "total_price": "5,00 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1717111047,
        "name": "PRINGLES Patatas fritas sabor original, lata 165 g.",
        "image_url": "https://example.com/image-pringles-original.jpg",
        "price_per_unit": "1,99 € por lata",
        "total_price": "1,99 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1717111048,
        "name": "SANEX Gel de ducha dermoprotector, botella 600 ml.",
        "image_url": "https://example.com/image-sanex-gel.jpg",
        "price_per_unit": "2,75 € por botella",
        "total_price": "2,75 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1717111049,
        "name": "CILLIT BANG Quitagrasas y brillo, spray 750 ml.",
        "image_url": "https://example.com/image-cillit-bang.jpg",
        "price_per_unit": "3,50 € por spray",
        "total_price": "3,50 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1717111050,
        "name": "FONT VELLA Agua mineral, pack de 6 x 1.5 L.",
        "image_url": "https://example.com/image-font-vella.jpg",
        "price_per_unit": "3,60 € por pack",
        "total_price": "3,60 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1717111051,
        "name": "MAGGI Sopa de pollo con fideos, caja 50 g.",
        "image_url": "https://example.com/image-maggi-sopa.jpg",
        "price_per_unit": "0,80 € por caja",
        "total_price": "0,80 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1717111052,
        "name": "ORO Líquido lavavajillas a mano, botella 500 ml.",
        "image_url": "https://example.com/image-oro-lavavajillas.jpg",
        "price_per_unit": "1,25 € por botella",
        "total_price": "1,25 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1717111053,
        "name": "PHILADELPHIA Queso crema original, envase 200 g.",
        "image_url": "https://example.com/image-philadelphia-queso.jpg",
        "price_per_unit": "2,10 € por envase",
        "total_price": "2,10 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1717111054,
        "name": "ACT II Palomitas de maíz para microondas, caja 100 g.",
        "image_url": "https://example.com/image-act-ii-palomitas.jpg",
        "price_per_unit": "0,99 € por caja",
        "total_price": "0,99 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1717111055,
        "name": "SUNNY DELIGHT Bebida refrescante de naranja, botella 1 L.",
        "image_url": "https://example.com/image-sunny-delight.jpg",
        "price_per_unit": "1,50 € por botella",
        "total_price": "1,50 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1717111056,
        "name": "BREF WC Bloque para inodoro, pack de 3.",
        "image_url": "https://example.com/image-bref-wc.jpg",
        "price_per_unit": "2,95 € por pack",
        "total_price": "2,95 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1718111057,
        "name": "BIC Bolígrafos Cristal, pack de 10 unidades.",
        "image_url": "https://example.com/image-bic-boligrafos.jpg",
        "price_per_unit": "0,20 € por bolígrafo",
        "total_price": "2,00 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1718111058,
        "name": "DEL MONTE Melocotón en almíbar, lata 825 g.",
        "image_url": "https://example.com/image-del-monte-melocoton.jpg",
        "price_per_unit": "3,45 € por lata",
        "total_price": "3,45 €",
        "supermercado": "alcampo"
    },
    {
        "scrapped_timestamp": 1718111059,
        "name": "NIVEA Crema hidratante, tarro 150 ml.",
        "image_url": "https://example.com/image-nivea-crema.jpg",
        "price_per_unit": "5,20 € por tarro",
        "total_price": "5,20 €",
        "supermercado": "hipercor"
    },
    {
        "scrapped_timestamp": 1718111060,
        "name": "HERSHEY'S Chocolate con almendras, barra 150 g.",
        "image_url": "https://example.com/image-hersheys-chocolate.jpg",
        "price_per_unit": "2,50 € por barra",
        "total_price": "2,50 €",
        "supermercado": "alcampo"
    }
]


for item in items:
    try:
        response = table.put_item(Item=item)
        print("Item inserted successfully:", response)
    except Exception as e:
        print("Error inserting item into DynamoDB:", e)