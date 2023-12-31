# Use an official Node runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app


# Bundle app source inside the Docker image
COPY . .

# Install any needed packages specified in package.json
RUN npm install
RUN npm install express
RUN npm install -g nodemon

RUN ls -ltr


# Make port available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NODE_ENV production

# Run the app when the container launches
ENTRYPOINT [ "npm", "run", "serve" ]