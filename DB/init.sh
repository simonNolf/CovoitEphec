#!/bin/bash

# Lire les variables d'environnement depuis le fichier .env
source "$(dirname "$0")/.env"

# Connexion à la base de données PostgreSQL et exécution du script SQL d'initialisation
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "CREATE DATABASE $PGDATABASE"
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f /docker-entrypoint-initdb.d/init.sql
