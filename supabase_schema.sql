--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ogr_system_tables; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA ogr_system_tables;


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: event_trigger_function_for_metadata(); Type: FUNCTION; Schema: ogr_system_tables; Owner: -
--

CREATE FUNCTION ogr_system_tables.event_trigger_function_for_metadata() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    obj record;
BEGIN
  IF has_schema_privilege('ogr_system_tables', 'USAGE') THEN
   IF has_table_privilege('ogr_system_tables.metadata', 'DELETE') THEN
    FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
    LOOP
        IF obj.object_type = 'table' THEN
            DELETE FROM ogr_system_tables.metadata m WHERE m.schema_name = obj.schema_name AND m.table_name = obj.object_name;
        END IF;
    END LOOP;
   END IF;
  END IF;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: metadata; Type: TABLE; Schema: ogr_system_tables; Owner: -
--

CREATE TABLE ogr_system_tables.metadata (
    id integer NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    metadata text
);


--
-- Name: metadata_id_seq; Type: SEQUENCE; Schema: ogr_system_tables; Owner: -
--

CREATE SEQUENCE ogr_system_tables.metadata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: metadata_id_seq; Type: SEQUENCE OWNED BY; Schema: ogr_system_tables; Owner: -
--

ALTER SEQUENCE ogr_system_tables.metadata_id_seq OWNED BY ogr_system_tables.metadata.id;


--
-- Name: actes_deces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actes_deces (
    id bigint NOT NULL,
    numero_acte character varying(191) NOT NULL,
    province character varying(191) DEFAULT 'Ouest'::character varying NOT NULL,
    departement character varying(191) DEFAULT 'Mifi'::character varying NOT NULL,
    arrondissement character varying(191) DEFAULT 'Bafoussam I'::character varying NOT NULL,
    centre character varying(191) DEFAULT 'Mairie Rurale de Bafoussam 1er'::character varying NOT NULL,
    dresse_le timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nom_decede character varying(191) NOT NULL,
    date_deces date NOT NULL,
    lieu_deces character varying(191) NOT NULL,
    sexe character varying(255) NOT NULL,
    lieu_naiss_decede character varying(191) NOT NULL,
    date_naiss_decede date NOT NULL,
    age integer,
    profession_decede character varying(191),
    domicile_decede character varying(191),
    nom_pere_decede character varying(191),
    domicile_pere_decede character varying(191),
    nom_mere_decede character varying(191),
    domicile_mere_decede character varying(191),
    declaration character varying(191) NOT NULL,
    secretaire character varying(191) NOT NULL,
    officier character varying(191) NOT NULL,
    cni_decede character varying(191),
    acte_naissance_decede character varying(191),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    coordonnees public.geography(Point,4326),
    CONSTRAINT actes_deces_sexe_check CHECK (((sexe)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying])::text[])))
);


--
-- Name: actes_deces_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.actes_deces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: actes_deces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.actes_deces_id_seq OWNED BY public.actes_deces.id;


--
-- Name: actes_mariage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actes_mariage (
    id bigint NOT NULL,
    numero_acte character varying(191) NOT NULL,
    province character varying(191) DEFAULT 'Ouest'::character varying NOT NULL,
    departement character varying(191) DEFAULT 'Mifi'::character varying NOT NULL,
    arrondissement character varying(191) DEFAULT 'Bafoussam I'::character varying NOT NULL,
    centre character varying(191) DEFAULT 'Mairie Rurale de Bafoussam 1er'::character varying NOT NULL,
    contracte_le timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    celebre_le timestamp(0) without time zone,
    nom_homme character varying(191),
    nom_pere_homme character varying(191),
    nom_mere_homme character varying(191),
    date_naiss_homme date,
    race_homme character varying(191),
    groupement_homme character varying(191),
    subdivision_homme character varying(191),
    region_homme character varying(191),
    profession_homme character varying(191),
    residence_homme character varying(191),
    nom_femme character varying(191),
    nom_pere_femme character varying(191),
    nom_mere_femme character varying(191),
    date_naiss_femme date,
    race_femme character varying(191),
    groupement_femme character varying(191),
    subdivision_femme character varying(191),
    region_femme character varying(191),
    profession_femme character varying(191),
    residence_femme character varying(191),
    regime character varying(191) NOT NULL,
    consentement_epoux character varying(191) DEFAULT 'Oui'::character varying NOT NULL,
    consentement_epouse character varying(191) DEFAULT 'Oui'::character varying NOT NULL,
    consentement_chef_famille character varying(191) DEFAULT 'Oui'::character varying NOT NULL,
    opposition character varying(191) DEFAULT 'Non'::character varying NOT NULL,
    dot_montant_convenu numeric(12,2),
    dot_montant_verse numeric(12,2),
    date_versement date,
    date_versement_complementaire date,
    temoin1_homme character varying(191),
    temoin2_homme character varying(191),
    temoin1_femme character varying(191),
    temoin2_femme character varying(191),
    secretaire character varying(191),
    officier character varying(191),
    cni_homme character varying(191),
    cni_femme character varying(191),
    acte_homme character varying(191),
    acte_femme character varying(191),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    coordonnees public.geography(Point,4326)
);


--
-- Name: actes_mariage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.actes_mariage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: actes_mariage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.actes_mariage_id_seq OWNED BY public.actes_mariage.id;


--
-- Name: actes_naissance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actes_naissance (
    id bigint NOT NULL,
    numero_acte character varying(191) NOT NULL,
    province character varying(191) DEFAULT 'Ouest'::character varying NOT NULL,
    departement character varying(191) DEFAULT 'Mifi'::character varying NOT NULL,
    arrondissement character varying(191) DEFAULT 'Bafoussam I'::character varying NOT NULL,
    centre character varying(191) DEFAULT 'Mairie Rurale de Bafoussam 1er'::character varying NOT NULL,
    nom character varying(191) NOT NULL,
    date_naiss date NOT NULL,
    lieu character varying(191) NOT NULL,
    sexe character varying(255) NOT NULL,
    nom_pere character varying(191),
    lieu_naiss_pere character varying(191),
    date_naiss_pere date,
    domicile_pere character varying(191),
    profession_pere character varying(191),
    nom_mere character varying(191),
    lieu_naiss_mere character varying(191),
    date_naiss_mere date,
    domicile_mere character varying(191),
    profession_mere character varying(191),
    dresse timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    declaration character varying(191) NOT NULL,
    secretaire character varying(191) NOT NULL,
    officier character varying(191) NOT NULL,
    cni_pere character varying(191),
    cni_mere character varying(191),
    certificat_naissance character varying(191),
    acte_mariage character varying(191),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    coordonnees public.geography(Point,4326),
    CONSTRAINT actes_naissance_sexe_check CHECK (((sexe)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying])::text[])))
);


--
-- Name: actes_naissance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.actes_naissance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: actes_naissance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.actes_naissance_id_seq OWNED BY public.actes_naissance.id;


--
-- Name: audits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audits (
    id bigint NOT NULL,
    user_type character varying(191),
    user_id bigint,
    event character varying(191) NOT NULL,
    auditable_type character varying(191) NOT NULL,
    auditable_id bigint NOT NULL,
    old_values text,
    new_values text,
    url text,
    ip_address inet,
    user_agent character varying(1023),
    tags character varying(191),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: audits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audits_id_seq OWNED BY public.audits.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(191) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: mentions_marginales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mentions_marginales (
    id bigint NOT NULL,
    acte_type character varying(191) NOT NULL,
    acte_id bigint NOT NULL,
    numero_acte character varying(191) NOT NULL,
    nom_personne character varying(191),
    motif character varying(191) NOT NULL,
    texte text NOT NULL,
    date_mention date NOT NULL,
    officier character varying(191),
    secretaire character varying(191),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: mentions_marginales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mentions_marginales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mentions_marginales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mentions_marginales_id_seq OWNED BY public.mentions_marginales.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(191) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(191) NOT NULL,
    token character varying(191) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL
);


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(191) NOT NULL,
    tokenable_id bigint NOT NULL,
    name character varying(191) NOT NULL,
    token character varying(64) NOT NULL,
    abilities text NOT NULL,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(191) NOT NULL,
    email character varying(191) NOT NULL,
    password character varying(191) NOT NULL,
    sexe character varying(255),
    role character varying(191),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    last_login_at timestamp(0) without time zone,
    CONSTRAINT users_sexe_check CHECK (((sexe)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: zones_arrondissements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zones_arrondissements (
    ogc_fid integer NOT NULL,
    geom public.geometry(MultiPolygon,4326),
    nom_arr character varying(50),
    nom_dep character varying(50),
    nom_reg character varying(50)
);


--
-- Name: zones_arrondissements_ogc_fid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zones_arrondissements_ogc_fid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zones_arrondissements_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zones_arrondissements_ogc_fid_seq OWNED BY public.zones_arrondissements.ogc_fid;


--
-- Name: zones_departements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zones_departements (
    ogc_fid integer NOT NULL,
    geom public.geometry(MultiPolygon,4326),
    nom_dep character varying(50),
    nom_reg character varying(50)
);


--
-- Name: zones_departements_ogc_fid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zones_departements_ogc_fid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zones_departements_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zones_departements_ogc_fid_seq OWNED BY public.zones_departements.ogc_fid;


--
-- Name: zones_regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zones_regions (
    ogc_fid integer NOT NULL,
    geom public.geometry(MultiPolygon,4326),
    nom_reg character varying(50)
);


--
-- Name: zones_regions_ogc_fid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zones_regions_ogc_fid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zones_regions_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zones_regions_ogc_fid_seq OWNED BY public.zones_regions.ogc_fid;


--
-- Name: metadata id; Type: DEFAULT; Schema: ogr_system_tables; Owner: -
--

ALTER TABLE ONLY ogr_system_tables.metadata ALTER COLUMN id SET DEFAULT nextval('ogr_system_tables.metadata_id_seq'::regclass);


--
-- Name: actes_deces id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_deces ALTER COLUMN id SET DEFAULT nextval('public.actes_deces_id_seq'::regclass);


--
-- Name: actes_mariage id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_mariage ALTER COLUMN id SET DEFAULT nextval('public.actes_mariage_id_seq'::regclass);


--
-- Name: actes_naissance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_naissance ALTER COLUMN id SET DEFAULT nextval('public.actes_naissance_id_seq'::regclass);


--
-- Name: audits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audits ALTER COLUMN id SET DEFAULT nextval('public.audits_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: mentions_marginales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentions_marginales ALTER COLUMN id SET DEFAULT nextval('public.mentions_marginales_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: zones_arrondissements ogc_fid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones_arrondissements ALTER COLUMN ogc_fid SET DEFAULT nextval('public.zones_arrondissements_ogc_fid_seq'::regclass);


--
-- Name: zones_departements ogc_fid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones_departements ALTER COLUMN ogc_fid SET DEFAULT nextval('public.zones_departements_ogc_fid_seq'::regclass);


--
-- Name: zones_regions ogc_fid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones_regions ALTER COLUMN ogc_fid SET DEFAULT nextval('public.zones_regions_ogc_fid_seq'::regclass);


--
-- Name: metadata metadata_schema_name_table_name_key; Type: CONSTRAINT; Schema: ogr_system_tables; Owner: -
--

ALTER TABLE ONLY ogr_system_tables.metadata
    ADD CONSTRAINT metadata_schema_name_table_name_key UNIQUE (schema_name, table_name);


--
-- Name: actes_deces actes_deces_numero_acte_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_deces
    ADD CONSTRAINT actes_deces_numero_acte_unique UNIQUE (numero_acte);


--
-- Name: actes_deces actes_deces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_deces
    ADD CONSTRAINT actes_deces_pkey PRIMARY KEY (id);


--
-- Name: actes_mariage actes_mariage_numero_acte_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_mariage
    ADD CONSTRAINT actes_mariage_numero_acte_unique UNIQUE (numero_acte);


--
-- Name: actes_mariage actes_mariage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_mariage
    ADD CONSTRAINT actes_mariage_pkey PRIMARY KEY (id);


--
-- Name: actes_naissance actes_naissance_numero_acte_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_naissance
    ADD CONSTRAINT actes_naissance_numero_acte_unique UNIQUE (numero_acte);


--
-- Name: actes_naissance actes_naissance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actes_naissance
    ADD CONSTRAINT actes_naissance_pkey PRIMARY KEY (id);


--
-- Name: audits audits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: mentions_marginales mentions_marginales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentions_marginales
    ADD CONSTRAINT mentions_marginales_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: zones_arrondissements zones_arrondissements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones_arrondissements
    ADD CONSTRAINT zones_arrondissements_pkey PRIMARY KEY (ogc_fid);


--
-- Name: zones_departements zones_departements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones_departements
    ADD CONSTRAINT zones_departements_pkey PRIMARY KEY (ogc_fid);


--
-- Name: zones_regions zones_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones_regions
    ADD CONSTRAINT zones_regions_pkey PRIMARY KEY (ogc_fid);


--
-- Name: audits_auditable_type_auditable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audits_auditable_type_auditable_id_index ON public.audits USING btree (auditable_type, auditable_id);


--
-- Name: audits_user_id_user_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audits_user_id_user_type_index ON public.audits USING btree (user_id, user_type);


--
-- Name: idx_actes_deces_geo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_actes_deces_geo ON public.actes_deces USING gist (coordonnees);


--
-- Name: idx_actes_mariage_geo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_actes_mariage_geo ON public.actes_mariage USING gist (coordonnees);


--
-- Name: idx_actes_naissance_geo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_actes_naissance_geo ON public.actes_naissance USING gist (coordonnees);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: zones_arrondissements_geom_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX zones_arrondissements_geom_geom_idx ON public.zones_arrondissements USING gist (geom);


--
-- Name: zones_departements_geom_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX zones_departements_geom_geom_idx ON public.zones_departements USING gist (geom);


--
-- Name: zones_regions_geom_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX zones_regions_geom_geom_idx ON public.zones_regions USING gist (geom);


--
-- Name: ogr_system_tables_event_trigger_for_metadata; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER ogr_system_tables_event_trigger_for_metadata ON sql_drop
   EXECUTE FUNCTION ogr_system_tables.event_trigger_function_for_metadata();


--
-- PostgreSQL database dump complete
--

