BEGIN;

-- Table: public.car

CREATE TABLE IF NOT EXISTS public.car
(
    id integer NOT NULL DEFAULT nextval('car_id_seq'::regclass),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    places integer NOT NULL,
    CONSTRAINT car_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.covoiturage
(
    id integer NOT NULL DEFAULT nextval('covoiturage_id_seq'::regclass),
    id_conducteur character varying COLLATE pg_catalog."default" NOT NULL,
    passager integer NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL,
    date timestamp without time zone NOT NULL,
    heure timestamp without time zone NOT NULL,
    CONSTRAINT covoiturage_pkey PRIMARY KEY (id),
    CONSTRAINT conducteur FOREIGN KEY (id_conducteur)
        REFERENCES public."user" (matricule) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public.covoiturage
(
    id integer NOT NULL DEFAULT nextval('covoiturage_id_seq'::regclass),
    id_conducteur character varying COLLATE pg_catalog."default" NOT NULL,
    passager integer NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL,
    date timestamp without time zone NOT NULL,
    heure timestamp without time zone NOT NULL,
    CONSTRAINT covoiturage_pkey PRIMARY KEY (id),
    CONSTRAINT conducteur FOREIGN KEY (id_conducteur)
        REFERENCES public."user" (matricule) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public.etape
(
    id integer NOT NULL DEFAULT nextval('etape_id_seq'::regclass),
    adresse point NOT NULL,
    CONSTRAINT etape_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.user_covoit
(
    id_etape integer NOT NULL,
    id_covoit integer NOT NULL,
    numero integer NOT NULL,
    CONSTRAINT etape_covoit_pkey PRIMARY KEY (id_etape, id_covoit)
);

CREATE TABLE IF NOT EXISTS public.proposition
(
    id integer NOT NULL DEFAULT nextval('propostition_id_seq'::regclass),
    matricule_conducteur character varying COLLATE pg_catalog."default" NOT NULL,
    id_car integer NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    adresse point NOT NULL,
    date timestamp without time zone NOT NULL,
    heure time without time zone NOT NULL,
    places integer NOT NULL,
    CONSTRAINT propostition_pkey PRIMARY KEY (id),
    CONSTRAINT matricule_conducteur FOREIGN KEY (matricule_conducteur)
        REFERENCES public."user" (matricule) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public.role
(
    id integer NOT NULL DEFAULT nextval('role_id_seq'::regclass),
    role character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT role_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.token
(
    token_id integer NOT NULL DEFAULT nextval('token_token_id_seq'::regclass),
    matricule character varying(255) COLLATE pg_catalog."default" NOT NULL,
    token text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_to timestamp without time zone,
    CONSTRAINT token_pkey PRIMARY KEY (token_id),
    CONSTRAINT matricule FOREIGN KEY (matricule)
        REFERENCES public."user" (matricule) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public."user"
(
    matricule character varying(8) COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    salt character varying COLLATE pg_catalog."default" NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    activation_expiration timestamp with time zone NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (matricule)
)

CREATE TABLE IF NOT EXISTS public.user_car
(
    matricule character varying COLLATE pg_catalog."default" NOT NULL,
    id_car integer NOT NULL DEFAULT nextval('user_car_id_car_seq'::regclass),
    CONSTRAINT user_car_pkey PRIMARY KEY (matricule, id_car),
    CONSTRAINT id_car FOREIGN KEY (id_car)
        REFERENCES public.car (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT user_car FOREIGN KEY (matricule)
        REFERENCES public."user" (matricule) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public.user_covoit
(
    id_etape integer NOT NULL,
    id_covoit integer NOT NULL,
    numero integer NOT NULL,
    CONSTRAINT user_covoit_pkey PRIMARY KEY (id_etape, id_covoit),
    CONSTRAINT id_covoit FOREIGN KEY (id_covoit)
        REFERENCES public.covoiturage (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT id_etape FOREIGN KEY (id_etape)
        REFERENCES public.etape (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public.user_data
(
    matricule character varying COLLATE pg_catalog."default" NOT NULL,
    nom character varying COLLATE pg_catalog."default",
    prenom character varying COLLATE pg_catalog."default",
    adresse point,
    numero integer,
    CONSTRAINT user_data_pkey PRIMARY KEY (matricule),
    CONSTRAINT matricule FOREIGN KEY (matricule)
        REFERENCES public."user" (matricule) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public.user_role
(
    matricule character varying COLLATE pg_catalog."default" NOT NULL,
    id_role integer NOT NULL,
    CONSTRAINT user_role_pkey PRIMARY KEY (matricule, id_role),
    CONSTRAINT id_role FOREIGN KEY (id_role)
        REFERENCES public.role (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT matricule FOREIGN KEY (matricule)
        REFERENCES public."user" (matricule) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

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
