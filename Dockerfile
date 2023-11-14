FROM surrealdb/surrealdb:latest

EXPOSE 8080

CMD [ "start","--user","root","--pass","root","--bind","0.0.0.0:8080","memory" ]