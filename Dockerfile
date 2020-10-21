FROM node:14.14.0-alpine3.12
COPY "package.json" "/usr/app/package.json"
COPY "yarn.lock" "/usr/app/yarn.lock"
WORKDIR "/usr/app"
RUN "yarn" "install"
COPY "server.js" "/usr/app/server.js"
EXPOSE 8080
CMD [ "yarn", "start" ]