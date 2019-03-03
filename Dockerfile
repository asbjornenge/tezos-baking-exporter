FROM node:11-alpine
RUN mkdir /app
ADD *.js /app/
ADD *.json /app/
WORKDIR /app
RUN npm install
ENTRYPOINT ["node","index.js"]
