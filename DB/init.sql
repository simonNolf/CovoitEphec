-- Création de la base de données TFE
CREATE DATABASE IF NOT EXISTS "TFE"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'French_Belgium.1252'
    LC_CTYPE = 'French_Belgium.1252'
    TEMPLATE = template0;

-- Changement du search_path vers le schéma public
SET search_path = public;

-- Création de la table "user"
CREATE TABLE IF NOT EXISTS "user"
(
    matricule character varying(8) NOT NULL,
    password character varying NOT NULL,
    salt character varying NOT NULL,
    status character varying NOT NULL DEFAULT 'pending',
    activation_expiration timestamp with time zone NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (matricule)
);
