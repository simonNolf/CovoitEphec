# Utilisation d'une image officielle PostgreSQL
FROM postgres:16.2

# Copie du fichier .env
COPY .env .

# Copie du fichier init.sql dans le répertoire /docker-entrypoint-initdb.d/
# Ce répertoire est spécialement pris en compte par l'image officielle PostgreSQL
COPY init.sql /docker-entrypoint-initdb.d/

# Lecture des variables d'environnement depuis le fichier .env
ENV $(cat .env | xargs)

