-- SCHEMA: public

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public."user"
(
    matricule character varying(8) NOT NULL,
    password character varying NOT NULL,
    salt character varying NOT NULL,
    status character varying NOT NULL DEFAULT 'pending',
    activation_expiration timestamp with time zone NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (matricule)
);
