# recommended LTS version of Node.js
# derived from the Alpine Linux project
# will help us keep our image size down
FROM node:lts-alpine

# By default, the Docker Node image includes
# a non-root node user that you can use 
# to avoid running your application container as root

# use the node user’s home directory as 
# the working directory for our application.

# create the node_modules subdirectory 
# in /home/node along with the app directory
# and set ownership on them to our node user:
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# If a WORKDIR isn’t set, 
# Docker will create one by default, 
# so it’s a good idea to set it explicitly.
WORKDIR /home/node/app

# copy the package.json and package-lock.json files
COPY --chown=node:node package*.json ./
# Adding this COPY instruction before running 
# npm install or copying the application code 
# allows us to take advantage of Docker’s caching mechanism. 
# At each stage in the build, 
# Docker will check whether it has  
# a layer cached for that particular instruction. 
# If we change package.json, 
# this layer will be rebuilt, 
# but if we don’t,
# this instruction will allow Docker 
# to use the existing image layer 
# and skip reinstalling our node modules.

# To ensure that all of the application files 
# are owned by the non-root node user, 
# including the contents of the node_modules directory, 
# switch the user to node before running npm install
USER node

# Install applicaion dependencies
# using a npmrc (if passed in) configured to download any private packages
# omitting any devDependencies 
RUN --mount=type=secret,id=npmrc,target=/home/node/.npmrc,uid=1000 npm install --omit=dev

# copy your application code 
# with the appropriate permissions 
# to the application directory on the container
COPY --chown=node:node . .

# expose port 8080 on the container 
# and start the application
EXPOSE 8080
CMD [ "npm", "run", "start:docker" ]