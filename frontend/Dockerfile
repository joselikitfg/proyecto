
FROM node:21-alpine3.18

EXPOSE 3000
EXPOSE 35729


WORKDIR /app


ENV PATH /app/node_modules/.bin:$PATH

RUN npm install react-scripts@5.0.1 -g

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install ci


COPY . /app


CMD ["npm", "start"]