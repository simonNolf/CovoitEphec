BEGIN;

CREATE TABLE IF NOT EXISTS public.car
(
    id serial NOT NULL,
    name character varying NOT NULL,
    places integer NOT NULL,
    CONSTRAINT car_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.covoiturage
(
    id serial NOT NULL,
    id_conducteur character varying NOT NULL,
    passager integer NOT NULL,
    status character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    heure timestamp without time zone NOT NULL,
    CONSTRAINT covoiturage_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.demande
(
    id serial NOT NULL,
    demandeur character varying NOT NULL,
    status character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    heure timestamp without time zone NOT NULL,
    CONSTRAINT demande_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.etape
(
    id serial NOT NULL,
    adresse point NOT NULL,
    CONSTRAINT etape_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.user_covoit
(
    id_etape integer NOT NULL,
    id_covoit integer NOT NULL,
    numero integer NOT NULL,
    CONSTRAINT etape_covoit_pkey PRIMARY KEY (id_etape, id_covoit)
);

CREATE TABLE IF NOT EXISTS public.proposition
(
    id serial NOT NULL,
    matricule_conducteur character varying NOT NULL,
    id_car integer NOT NULL,
    status character varying NOT NULL DEFAULT 'pending',
    CONSTRAINT proposition_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.role
(
    id serial NOT NULL,
    role character varying NOT NULL,
    CONSTRAINT role_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.token
(
    token_id serial NOT NULL,
    matricule character varying(255) NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_to timestamp without time zone,
    CONSTRAINT token_pkey PRIMARY KEY (token_id)
);

CREATE TABLE IF NOT EXISTS public."user"
(
    matricule character varying(8) NOT NULL,
    password character varying NOT NULL,
    salt character varying NOT NULL,
    status character varying NOT NULL DEFAULT 'pending',
    activation_expiration timestamp with time zone NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (matricule)
);

CREATE TABLE IF NOT EXISTS public.user_car
(
    matricule character varying NOT NULL,
    id_car serial NOT NULL,
    CONSTRAINT user_car_pkey PRIMARY KEY (matricule, id_car)
);

CREATE TABLE IF NOT EXISTS public.user_data
(
    matricule character varying NOT NULL,
    nom character varying,
    prenom character varying,
    adresse point,
    numero integer,
    CONSTRAINT user_data_pkey PRIMARY KEY (matricule)
);

CREATE TABLE IF NOT EXISTS public.user_role
(
    matricule character varying NOT NULL,
    id_role integer NOT NULL,
    CONSTRAINT user_role_pkey PRIMARY KEY (matricule, id_role)
);

ALTER TABLE IF EXISTS public.covoiturage
    ADD FOREIGN KEY (id_conducteur)
    REFERENCES public."user" (matricule);

ALTER TABLE IF EXISTS public.demande
    ADD FOREIGN KEY (demandeur)
    REFERENCES public."user" (matricule);

ALTER TABLE IF EXISTS public.user_covoit
    ADD FOREIGN KEY (id_etape)
    REFERENCES public.etape (id);

ALTER TABLE IF EXISTS public.user_covoit
    ADD FOREIGN KEY (id_covoit)
    REFERENCES public.covoiturage (id);

ALTER TABLE IF EXISTS public.proposition
    ADD FOREIGN KEY (matricule_conducteur)
    REFERENCES public."user" (matricule);

ALTER TABLE IF EXISTS public.token
    ADD FOREIGN KEY (matricule)
    REFERENCES public."user" (matricule);

ALTER TABLE IF EXISTS public.user_car
    ADD FOREIGN KEY (matricule)
    REFERENCES public."user" (matricule);

ALTER TABLE IF EXISTS public.user_car
    ADD FOREIGN KEY (id_car)
    REFERENCES public.car (id);

ALTER TABLE IF EXISTS public.user_data
    ADD FOREIGN KEY (matricule)
    REFERENCES public."user" (matricule);

ALTER TABLE IF EXISTS public.user_role
    ADD FOREIGN KEY (id_role)
    REFERENCES public.role (id);

ALTER TABLE IF EXISTS public.user_role
    ADD FOREIGN KEY (matricule)
    REFERENCES public."user" (matricule);

END;
