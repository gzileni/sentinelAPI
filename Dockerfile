FROM node:14-alpine
LABEL Author Giuseppe Zileni <giuseppe.zileni@gmail.com>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN yarn install && yarn start

EXPOSE 3000

CMD [ "yarn", "npm", "start" ]