# Supported tags and respective `Dockerfile` links

-	[`latest`, `1.0.0`](https://github.com/ilinaraducristian/MOEA-Web-Framework-CDN/blob/master/Dockerfile)

# What is CDN?

CDN is a REST API file server that lets the user interact with the files using http requests.

# How to use this image

## start a CDN instance

```console
$ docker run --name some-cdn -d -p 8080:8080 ilinaraducristian/cdn
```

## ... or via [`docker-compose`](https://github.com/docker/compose)

Example `docker-compose.yml` for `CDN`:

```yaml
version: "3"
services:
  cdn:
    image: ilinaraducristian/cdn
    ports:
      - "8080:8080"
    volumes:
      - ./content:/usr/content
```

Run `docker-compose up -d` , wait for it to initialize completely, and send requests to `http://localhost:8080`, or `http://host-ip:8080` (as appropriate).