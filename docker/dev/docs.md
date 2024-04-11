BUILDING DOCKER IMAGE : `docker build -t node-template-docker-image .`

RUNNING DOCKER CONTAINER : `docker run --env-file .env  --rm -d  -p 3000:3000 -v $(pwd):/usr/src/app  --name node-template-docker-container  node-template-docker-image`

VIEWING RUNNING CONTAINERS : `docker ps`

STOPPING DOCKER CONTAINER : `docker stop node-template-docker-container`

---

# Steps to crete postgres in docker for testing :

[postgres docker setup for testing](https://codersgyan.notion.site/Setting-up-PostgreSQL-in-a-Docker-Container-with-Persistent-Volume-58711388eb244c9fa1597d87783e3f92)

# Create PG Docker instance start for testing :

`docker run --rm --name mernpg-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -v mernpgdata:/var/lib/postgresql/data -p 5432:5432 -d postgres`

CREATING PRODUCTION GRADE DOCKER IMAGE : `docker build -t mern_prod_test -f docker/prod/Dockerfile .`

# To kill pg container running port :

`Error: Docker: Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:5432 -> 0.0.0.0:0: listen tcp 0.0.0.0:5432: bind: address already in use.`

You can use the following command to find out which process is using port 5432:

`sudo lsof -i :5432`

This will show you the process ID (PID) of the process using that port. You can then use the following command to kill the process:

`sudo kill -9 <PID>`
