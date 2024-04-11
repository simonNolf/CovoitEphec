# Utilisez l'image Node.js 14
FROM node:latest

RUN npm install -g npm@latest

# Définit le répertoire de travail à l'intérieur du conteneur
WORKDIR /app

# Copie le fichier package.json et le fichier package-lock.json (si existant)
COPY . .

# Installe les dépendances, y compris express
RUN npm install
RUN npm install express

# Installe nodemon globalement
RUN npm install -g nodemon


# Commande à exécuter lorsque le conteneur démarre
CMD ["npm", "start"]
