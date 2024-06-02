CREATE TABLE IF NOT EXISTS public.car
(
    id integer PRIMARY KEY DEFAULT nextval('car_id_seq'::regclass),
    name character varying NOT NULL,
    places integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.role
(
    id integer PRIMARY KEY DEFAULT nextval('role_id_seq'::regclass),
    role character varying NOT NULL
);

CREATE TABLE IF NOT EXISTS public.token
(
    token_id integer PRIMARY KEY DEFAULT nextval('token_token_id_seq'::regclass),
    matricule character varying(255) NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_to timestamp without time zone,
    CONSTRAINT token_matricule_fkey FOREIGN KEY (matricule)
        REFERENCES public."user" (matricule) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."user"
(
    matricule character varying(8) PRIMARY KEY,
    password character varying NOT NULL,
    salt character varying NOT NULL,
    status character varying NOT NULL DEFAULT 'pending',
    activation_expiration timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_data
(
    matricule character varying PRIMARY KEY,
    nom character varying,
    prenom character varying,
    adresse point,
    CONSTRAINT "user" FOREIGN KEY (matricule)
        REFERENCES public."user" (matricule) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.user_role
(
    matricule character varying NOT NULL,
    id_role integer NOT NULL,
    CONSTRAINT user_role_pkey PRIMARY KEY (matricule, id_role),
    CONSTRAINT data_role FOREIGN KEY (matricule)
        REFERENCES public.user_data (matricule) ON DELETE NO ACTION,
    CONSTRAINT role FOREIGN KEY (id_role)
        REFERENCES public.role (id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.user_car
(
    matricule character varying NOT NULL,
    id_car integer NOT NULL DEFAULT nextval('user_car_id_car_seq'::regclass),
    CONSTRAINT user_car_pkey PRIMARY KEY (matricule, id_car),
    CONSTRAINT car FOREIGN KEY (id_car)
        REFERENCES public.car (id) ON DELETE CASCADE,
    CONSTRAINT matricule FOREIGN KEY (matricule)
        REFERENCES public."user" (matricule) ON DELETE CASCADE
);
