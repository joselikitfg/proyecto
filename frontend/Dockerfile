
FROM node:21-alpine3.18

EXPOSE 3000
EXPOSE 35729


WORKDIR /app


ENV PATH /app/node_modules/.bin:$PATH


RUN npm install -g pnpm

RUN pnpm install react-scripts@5.0.1 

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN pnpm install ci


COPY . /app


CMD ["npm", "start"]