# Usa la imagen oficial de Node.js con Alpine Linux para un tamaño de imagen reducido
FROM node:21-alpine3.18 AS runtime

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de definición de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Construye el proyecto Astro
RUN npm run build

# Define variables de entorno para el servidor de producción
ENV HOST=0.0.0.0 PORT=4321

# Expone el puerto 4321
EXPOSE 4321

# Comando para iniciar el servidor de Astro
CMD ["node", "./dist/server/entry.mjs"]