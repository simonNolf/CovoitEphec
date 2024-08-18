# Première étape : build de l'application
FROM node:14 AS builder

# Répertoire de travail
WORKDIR /app

# Copie de tous les fichiers de l'application
COPY . /app

# Installation des dépendances et build de l'application
RUN npm install && npm run build
RUN sudo apt update
RUN sudo apt install certbot python3-certbot-apache
RUN sudo certbot --apache


# Deuxième étape : création de l'image finale
FROM httpd:alpine

# Copie des fichiers buildés depuis l'étape précédente
COPY --from=builder /app/build /usr/local/apache2/htdocs/

# Exposition du port 80
EXPOSE 80

# Le serveur Apache démarre automatiquement avec l'image
