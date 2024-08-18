# Première étape : build de l'application
FROM node:14 AS builder

# Répertoire de travail
WORKDIR /app

# Copie de tous les fichiers de l'application
COPY . /app

# Installation des dépendances et build de l'application
RUN npm install && npm run build


# Deuxième étape : création de l'image finale
FROM ubuntu:latest

# Mise à jour des paquets et installation d'Apache
RUN apt-get update && \
    apt-get install -y apache2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copie des fichiers buildés depuis l'étape précédente
COPY --from=builder /app/build /var/www/html/

# Exposition du port 80
EXPOSE 80

# Commande pour démarrer Apache en mode premier plan
CMD ["apachectl", "-D", "FOREGROUND"]
