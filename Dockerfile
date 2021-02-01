FROM node:14-alpine
LABEL Author Giuseppe Zileni <giuseppe.zileni@gmail.com>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install && npm start

EXPOSE 3000

CMD [ "npm", "start" ]