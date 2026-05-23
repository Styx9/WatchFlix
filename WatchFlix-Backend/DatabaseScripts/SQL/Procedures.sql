DROP FUNCTION IF EXISTS get_istoric_client(integer);
DROP FUNCTION IF EXISTS get_profil_client(integer);
DROP FUNCTION IF EXISTS get_filme_populare(integer);
DROP FUNCTION IF EXISTS get_sentiment_film(integer);
DROP FUNCTION IF EXISTS get_sentiment_categorie(integer);
DROP FUNCTION IF EXISTS get_sentiment_actor(integer);
DROP FUNCTION IF EXISTS get_grupare_clienti();
DROP FUNCTION IF EXISTS get_predictii_sezoniere(integer, integer, integer);
DROP PROCEDURE IF EXISTS genereaza_recomandari(integer);
DROP PROCEDURE IF EXISTS adauga_vot(integer, integer, integer);

--Functie: Returneaza profilul unui client

create or replace function get_profil_client(p_id_client integer)
    returns table (
                      categorie_preferata varchar,
                      actor_preferat varchar,
                      total_filme_vazute bigint,
                      total_filme_votate bigint,
                      rating_mediu_acordat numeric,
                      sentiment_dominant varchar
                  )
    language plpgsql
as $$
declare
    v_count integer;
begin
    select count(*) into v_count from clienti where id = p_id_client;
    if v_count = 0 then
        raise exception 'clientul cu id=% nu exista in baza de date.', p_id_client
            using errcode = 'P0001';
    end if;

    return query
        select
            -- categoria cel mai des vizualizata
            (
                select c.nume
                from vizualizari viz
                         join filme f on f.id = viz.id_film
                         join categorii c on c.id = f.id_categorie
                where viz.id_client = p_id_client
                group by c.nume
                order by count(*) desc
                limit 1
            )::varchar as categorie_preferata,

            -- actorul cel mai des vazut
            (
                select a.prenume || ' ' || a.nume_familie
                from vizualizari viz
                         join roluri r on r.id_film = viz.id_film
                         join actori a on a.id = r.id_actor
                where viz.id_client = p_id_client
                group by a.id, a.prenume, a.nume_familie
                order by count(*) desc
                limit 1
            )::varchar as actor_preferat,

            -- total filme vazute
            (
                select count(distinct id_film)
                from vizualizari
                where id_client = p_id_client
            ) as total_filme_vazute,

            -- total filme votate
            (
                select count(*)
                from voturi
                where id_client = p_id_client
            ) as total_filme_votate,

            -- rating mediu acordat de client
            (
                select round(avg(valoare)::numeric, 2)
                from voturi
                where id_client = p_id_client
            ) as rating_mediu_acordat,

            -- sentimentul dominant din comentariile clientului
            (
                select sentiment
                from comentarii
                where id_client = p_id_client
                group by sentiment
                order by count(*) desc
                limit 1
            )::varchar as sentiment_dominant;
end;
$$;

--Functie: Returneaza top N filme dupa un scor combinat din:
--rating mediu din voturi si numarul de vizualizari
create or replace function get_filme_populare(p_limit integer default 10)
    returns table (
                      id_film integer,
                      titlu varchar,
                      categorie varchar,
                      rating numeric,
                      nr_vizualizari bigint,
                      nr_voturi bigint,
                      scor_popularitate numeric
                  )
    language plpgsql
as $$
begin
    if p_limit <= 0 then
        raise exception 'Limita trebuie sa fie un numar pozitiv, primit: %', p_limit
            using errcode = 'P0003';
    end if;

    return query
        select
            f.id::integer,
            f.titlu::varchar,
            c.nume::varchar as categorie,
            round(avg(v.valoare)::numeric, 2) as rating,
            count(distinct viz.id) as nr_vizualizari,
            count(distinct v.id) as nr_voturi,
            -- scor popularitate: 70% rating + 30% vizualizari
            round(
                    (coalesce(avg(v.valoare), 0) * 7 +
                     least(count(distinct viz.id)::numeric / 10, 3))::numeric
                , 2) as scor_popularitate
        from filme f
                 join categorii c on c.id = f.id_categorie
                 left join voturi v on v.id_film = f.id
                 left join vizualizari viz on viz.id_film = f.id
        group by f.id, f.titlu, c.nume
        order by scor_popularitate desc
        limit p_limit;
end;
$$;

--Functie: Returneaza istoricul complet al vizualizarilor unui client

create or replace function get_istoric_client(p_id_client integer)
    returns table (
                      id_vizualizare integer,
                      id_film integer,
                      titlu_film varchar,
                      categorie  varchar,
                      data_vizualizare date,
                      versiune varchar,
                      stare varchar,
                      vot_acordat integer,
                      comentariu varchar,
                      sentiment  varchar
                  )
    language plpgsql
as $$
declare
    v_count integer;
begin
    select count(*) into v_count from clienti where id = p_id_client;
    if v_count = 0 then
        raise exception 'Clientul cu id=% nu exista in baza de date.', p_id_client
            using errcode = 'P0001';
    end if;

    return query
        select
            viz.id::integer as id_vizualizare,
            f.id::integer as id_film,
            f.titlu::varchar as titlu_film,
            c.nume::varchar as categorie,
            viz.data_vizualizare,
            (vf.rezolutie || ' - ' || vf.limba)::varchar  as versiune,
            viz.stare::varchar,
            vot.valoare as vot_acordat,
            com.text_comentariu::varchar as comentariu,
            com.sentiment::varchar
        from vizualizari viz
                 join filme f on f.id = viz.id_film
                 join categorii c on c.id = f.id_categorie
                 join versiuni_film vf on vf.id = viz.id_versiune
                 left join voturi vot on vot.id_film = viz.id_film and vot.id_client = viz.id_client
                 left join comentarii com on com.id_film = viz.id_film and com.id_client = viz.id_client
        where viz.id_client = p_id_client
        order by viz.data_vizualizare desc;
end;
$$;

--Procedura: Adauga sau actualizeaza votul unui client pentru un film
create or replace procedure adauga_vot(
    p_id_client integer,
    p_id_film   integer,
    p_valoare   integer
)
    language plpgsql
as $$
declare
    v_count integer;
begin
    select count(*) into v_count from clienti where id = p_id_client;
    if v_count = 0 then
        raise exception 'Clientul cu id=% nu exista in baza de date.', p_id_client
            using errcode = 'P0001';
    end if;

    select count(*) into v_count from filme where id = p_id_film;
    if v_count = 0 then
        raise exception 'Filmul cu id=% nu exista in baza de date.', p_id_film
            using errcode = 'P0004';
    end if;

    if p_valoare < 1 or p_valoare > 10 then
        raise exception 'Valoarea votului trebuie sa fie intre 1 si 10, primit: %', p_valoare
            using errcode = 'P0005';
    end if;
    insert into voturi (id_client, id_film, valoare, data_vot)
    values (p_id_client, p_id_film, p_valoare, current_date)
    on conflict (id_client, id_film)
        do update set valoare = excluded.valoare, data_vot = current_date;

    raise notice 'Vot inregistrat: client=%, film=%, valoare=%', p_id_client, p_id_film, p_valoare;
end;
$$;

create or replace function get_sentiment_film(p_id_film integer)
    returns table (
        id_film integer,
        titlu varchar,
        sentiment varchar,
        total_comentarii bigint,
        procent numeric
    )
    language plpgsql
as $$
begin
    return query
        select
            f.id::integer,
            f.titlu::varchar,
            coalesce(c.sentiment, 'NEUTRU')::varchar,
            count(c.id)::bigint,
            round(100.0 * count(c.id) / nullif(sum(count(c.id)) over (), 0), 2)
        from filme f
        left join comentarii c on c.id_film = f.id
        where f.id = p_id_film
        group by f.id, f.titlu, coalesce(c.sentiment, 'NEUTRU')
        order by total_comentarii desc;
end;
$$;

create or replace function get_sentiment_categorie(p_id_categorie integer)
    returns table (
        categorie varchar,
        sentiment varchar,
        total_comentarii bigint,
        rating_mediu numeric
    )
    language plpgsql
as $$
begin
    return query
        select
            cat.nume::varchar,
            coalesce(c.sentiment, 'NEUTRU')::varchar,
            count(c.id)::bigint,
            round(avg(f.rating)::numeric, 2)
        from categorii cat
        join filme f on f.id_categorie = cat.id
        left join comentarii c on c.id_film = f.id
        where cat.id = p_id_categorie
        group by cat.nume, coalesce(c.sentiment, 'NEUTRU')
        order by total_comentarii desc;
end;
$$;

create or replace function get_sentiment_actor(p_id_actor integer)
    returns table (
        id_actor integer,
        actor varchar,
        sentiment varchar,
        total_comentarii bigint,
        rating_mediu_filme numeric
    )
    language plpgsql
as $$
begin
    return query
        select
            a.id::integer,
            coalesce(a.nume_scena, a.prenume || ' ' || a.nume_familie)::varchar,
            coalesce(c.sentiment, 'NEUTRU')::varchar,
            count(c.id)::bigint,
            round(avg(f.rating)::numeric, 2)
        from actori a
        join roluri r on r.id_actor = a.id
        join filme f on f.id = r.id_film
        left join comentarii c on c.id_film = f.id
        where a.id = p_id_actor
        group by a.id, coalesce(a.nume_scena, a.prenume || ' ' || a.nume_familie), coalesce(c.sentiment, 'NEUTRU')
        order by total_comentarii desc;
end;
$$;

create or replace function get_grupare_clienti()
    returns table (
        id_client integer,
        client varchar,
        categorie_preferata varchar,
        sentiment_dominant varchar,
        rating_mediu_acordat numeric,
        segment varchar
    )
    language plpgsql
as $$
begin
    return query
        with profil as (
            select
                cl.id,
                (cl.prenume || ' ' || cl.nume)::varchar as client,
                (select c.nume
                 from vizualizari v
                 join filme f on f.id = v.id_film
                 join categorii c on c.id = f.id_categorie
                 where v.id_client = cl.id
                 group by c.nume
                 order by count(*) desc
                 limit 1)::varchar as categorie_preferata,
                (select co.sentiment
                 from comentarii co
                 where co.id_client = cl.id
                 group by co.sentiment
                 order by count(*) desc
                 limit 1)::varchar as sentiment_dominant,
                (select round(avg(vot.valoare)::numeric, 2)
                 from voturi vot
                 where vot.id_client = cl.id) as rating_mediu_acordat
            from clienti cl
        )
        select
            p.id::integer,
            p.client,
            coalesce(p.categorie_preferata, 'Fara istoric')::varchar,
            coalesce(p.sentiment_dominant, 'NEUTRU')::varchar,
            coalesce(p.rating_mediu_acordat, 0)::numeric,
            (
                coalesce(p.categorie_preferata, 'Fara istoric') || ' / ' ||
                coalesce(p.sentiment_dominant, 'NEUTRU') || ' / ' ||
                case
                    when coalesce(p.rating_mediu_acordat, 0) >= 8 then 'Entuziast'
                    when coalesce(p.rating_mediu_acordat, 0) >= 5 then 'Moderant'
                    else 'Critic'
                end
            )::varchar as segment
        from profil p
        order by segment, p.client;
end;
$$;

create or replace function get_predictii_sezoniere(
    p_luna_start integer,
    p_luna_end integer,
    p_limit integer default 10
)
    returns table (
        id_film integer,
        titlu varchar,
        categorie varchar,
        vizualizari_istorice bigint,
        rating numeric,
        scor_predictie numeric
    )
    language plpgsql
as $$
begin
    return query
        with viz_perioada as (
            select id_film, count(*) as nr_vizualizari
            from vizualizari
            where extract(month from data_vizualizare) between p_luna_start and p_luna_end
            group by id_film
        ),
        popularitate_categorii as (
            select f.id_categorie, count(*) as nr_vizualizari_categorie
            from vizualizari v
            join filme f on f.id = v.id_film
            where extract(month from v.data_vizualizare) between p_luna_start and p_luna_end
            group by f.id_categorie
        ),
        popularitate_actori as (
            select r.id_actor, count(*) as nr_vizualizari_actor
            from vizualizari v
            join roluri r on r.id_film = v.id_film
            where extract(month from v.data_vizualizare) between p_luna_start and p_luna_end
            group by r.id_actor
        ),
        reactii_filme as (
            select
                f.id as id_film,
                coalesce(avg(vot.valoare), f.rating, 0) as rating_reactii,
                sum(case
                    when com.sentiment = 'POZITIV' then 1
                    when com.sentiment = 'NEGATIV' then -1
                    else 0
                end) as scor_sentiment,
                sum(case
                    when op.tip = 'POZITIV' then 1
                    when op.tip = 'NEGATIV' then -1
                    else 0
                end) as scor_optiuni
            from filme f
            left join voturi vot on vot.id_film = f.id
            left join comentarii com on com.id_film = f.id
            left join client_optiuni co on co.id_film = f.id
            left join optiuni_predefinite op on op.id = co.id_optiune
            group by f.id, f.rating
        )
        select
            f.id::integer,
            f.titlu::varchar,
            c.nume::varchar,
            coalesce(vp.nr_vizualizari, 0)::bigint,
            round(coalesce(rf.rating_reactii, f.rating, 0)::numeric, 2),
            round((
                coalesce(vp.nr_vizualizari, 0) * 4.0
                + coalesce(pc.nr_vizualizari_categorie, 0) * 0.8
--                 + coalesce(sum(pa.nr_vizualizari_actor), 0) * 0.35
                + coalesce(rf.rating_reactii, f.rating, 0) * 5.0
                + coalesce(rf.scor_sentiment, 0) * 1.5
                + coalesce(rf.scor_optiuni, 0) * 1.0
            )::numeric, 2) as scor_predictie
        from filme f
        join categorii c on c.id = f.id_categorie
        left join viz_perioada vp on vp.id_film = f.id
        left join popularitate_categorii pc on pc.id_categorie = f.id_categorie
        left join roluri r on r.id_film = f.id
        left join popularitate_actori pa on pa.id_actor = r.id_actor
        left join reactii_filme rf on rf.id_film = f.id
        group by f.id, f.titlu, c.nume, f.rating, vp.nr_vizualizari,
                 pc.nr_vizualizari_categorie, rf.rating_reactii,
                 rf.scor_sentiment, rf.scor_optiuni
        order by scor_predictie desc, f.rating desc
        limit p_limit;
end;
$$;


--functie: returneaza profilul unui client

create or replace function get_profil_client(p_id_client integer)
    returns table (
                      categorie_preferata varchar,
                      actor_preferat varchar,
                      total_filme_vazute bigint,
                      total_filme_votate bigint,
                      rating_mediu_acordat numeric,
                      sentiment_dominant varchar
                  )
    language plpgsql
as $$
declare
    v_count integer;
begin
    select count(*) into v_count from clienti where id = p_id_client;
    if v_count = 0 then
        raise exception 'clientul cu id=% nu exista in baza de date.', p_id_client
            using errcode = 'P0001';
    end if;

    return query
        select
            -- categoria cel mai des vizualizata
            (
                select c.nume
                from vizualizari viz
                         join filme f on f.id = viz.id_film
                         join categorii c on c.id = f.id_categorie
                where viz.id_client = p_id_client
                group by c.nume
                order by count(*) desc
                limit 1
            )::varchar as categorie_preferata,

            -- actorul cel mai des vazut
            (
                select a.prenume || ' ' || a.nume_familie
                from vizualizari viz
                         join roluri r on r.id_film = viz.id_film
                         join actori a on a.id = r.id_actor
                where viz.id_client = p_id_client
                group by a.id, a.prenume, a.nume_familie
                order by count(*) desc
                limit 1
            )::varchar as actor_preferat,

            -- total filme vazute
            (
                select count(distinct id_film)
                from vizualizari
                where id_client = p_id_client
            ) as total_filme_vazute,

            -- total filme votate
            (
                select count(*)
                from voturi
                where id_client = p_id_client
            ) as total_filme_votate,

            -- rating mediu acordat de client
            (
                select round(avg(valoare)::numeric, 2)
                from voturi
                where id_client = p_id_client
            ) as rating_mediu_acordat,

            -- sentimentul dominant din comentariile clientului
            (
                select sentiment
                from comentarii
                where id_client = p_id_client
                group by sentiment
                order by count(*) desc
                limit 1
            )::varchar as sentiment_dominant;
end;
$$;

--functie: returneaza top n filme dupa un scor combinat din:
--rating mediu din voturi si numarul de vizualizari
create or replace function get_filme_populare(p_limit integer default 10)
    returns table (
                      id_film integer,
                      titlu varchar,
                      categorie varchar,
                      rating numeric,
                      nr_vizualizari bigint,
                      nr_voturi bigint,
                      scor_popularitate numeric
                  )
    language plpgsql
as $$
begin
    if p_limit <= 0 then
        raise exception 'limita trebuie sa fie un numar pozitiv, primit: %', p_limit
            using errcode = 'p0003';
    end if;

    return query
        select
            f.id::integer,
            f.titlu::varchar,
            c.nume::varchar as categorie,
            round(avg(v.valoare)::numeric, 2) as rating,
            count(distinct viz.id) as nr_vizualizari,
            count(distinct v.id) as nr_voturi,
            -- scor popularitate: 70% rating + 30% vizualizari
            round(
                    (coalesce(avg(v.valoare), 0) * 7 +
                     least(count(distinct viz.id)::numeric / 10, 3))::numeric
                , 2) as scor_popularitate
        from filme f
                 join categorii c on c.id = f.id_categorie
                 left join voturi v on v.id_film = f.id
                 left join vizualizari viz on viz.id_film = f.id
        group by f.id, f.titlu, c.nume
        order by scor_popularitate desc
        limit p_limit;
end;
$$;

--functie: returneaza istoricul complet al vizualizarilor unui client

create or replace function get_istoric_client(p_id_client integer)
    returns table (
                      id_vizualizare integer,
                      id_film integer,
                      titlu_film varchar,
                      categorie  varchar,
                      data_vizualizare date,
                      versiune varchar,
                      stare varchar,
                      vot_acordat integer,
                      comentariu varchar,
                      sentiment  varchar
                  )
    language plpgsql
as $$
declare
    v_count integer;
begin
    select count(*) into v_count from clienti where id = p_id_client;
    if v_count = 0 then
        raise exception 'clientul cu id=% nu exista in baza de date.', p_id_client
            using errcode = 'P0001';
    end if;

    return query
        select
            viz.id::integer as id_vizualizare,
            f.id::integer as id_film,
            f.titlu::varchar as titlu_film,
            c.nume::varchar as categorie,
            viz.data_vizualizare,
            (vf.rezolutie || ' - ' || vf.limba)::varchar  as versiune,
            viz.stare::varchar,
            vot.valoare as vot_acordat,
            com.text_comentariu::varchar as comentariu,
            com.sentiment::varchar
        from vizualizari viz
                 join filme f on f.id = viz.id_film
                 join categorii c on c.id = f.id_categorie
                 join versiuni_film vf on vf.id = viz.id_versiune
                 left join voturi vot on vot.id_film = viz.id_film and vot.id_client = viz.id_client
                 left join comentarii com on com.id_film = viz.id_film and com.id_client = viz.id_client
        where viz.id_client = p_id_client
        order by viz.data_vizualizare desc;
end;
$$;

--procedura: adauga sau actualizeaza votul unui client pentru un film
create or replace procedure adauga_vot(
    p_id_client integer,
    p_id_film   integer,
    p_valoare   integer
)
    language plpgsql
as $$
declare
    v_count integer;
begin
    select count(*) into v_count from clienti where id = p_id_client;
    if v_count = 0 then
        raise exception 'clientul cu id=% nu exista in baza de date.', p_id_client
            using errcode = 'p0001';
    end if;

    select count(*) into v_count from filme where id = p_id_film;
    if v_count = 0 then
        raise exception 'filmul cu id=% nu exista in baza de date.', p_id_film
            using errcode = 'p0004';
    end if;

    if p_valoare < 1 or p_valoare > 10 then
        raise exception 'valoarea votului trebuie sa fie intre 1 si 10, primit: %', p_valoare
            using errcode = 'p0005';
    end if;
    insert into voturi (id_client, id_film, valoare, data_vot)
    values (p_id_client, p_id_film, p_valoare, current_date)
    on conflict (id_client, id_film)
        do update set valoare = excluded.valoare, data_vot = current_date;

    raise notice 'vot inregistrat: client=%, film=%, valoare=%', p_id_client, p_id_film, p_valoare;
end;
$$;

----Procedura: Genereaza recomandari
--Algoritmul indentifica categoriile preferate ale clientului, gaseste clienti similari si calculeaza scorul pentru filmele nevazute si le salveaza
CREATE OR REPLACE PROCEDURE genereaza_recomandari(p_id_client INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM clienti WHERE id = p_id_client;
    IF v_count = 0 THEN
        RAISE EXCEPTION 'Clientul cu id=% nu exista in baza de date.', p_id_client
            USING ERRCODE = 'P0001';
    END IF;

    INSERT INTO recomandari (id_client, id_film, scor_compatibilitate, motiv, data_generare, vizualizata)
    WITH
    categorii_client AS (
        SELECT f.id_categorie, COUNT(*) AS frecventa
        FROM vizualizari v
        JOIN filme f ON f.id = v.id_film
        WHERE v.id_client = p_id_client
        GROUP BY f.id_categorie
    ),
    actori_client AS (
        SELECT r.id_actor, COUNT(*) AS frecventa
        FROM vizualizari v
        JOIN roluri r ON r.id_film = v.id_film
        WHERE v.id_client = p_id_client
        GROUP BY r.id_actor
    ),
    filme_deja_vazute AS (
        SELECT DISTINCT id_film
        FROM vizualizari
        WHERE id_client = p_id_client
    ),
    scor_filme AS (
        SELECT
            f.id AS id_film,
            LEAST(
                100,
                ROUND((
                    COALESCE(AVG(vot.valoare), f.rating, 0) * 5
                    + COUNT(DISTINCT viz.id) * 1.5
                    + COALESCE(MAX(cc.frecventa), 0) * 8
                    + COALESCE(SUM(ac.frecventa), 0) * 2
                    + COALESCE(SUM(CASE
                        WHEN com.sentiment = 'POZITIV' THEN 3
                        WHEN com.sentiment = 'NEGATIV' THEN -2
                        ELSE 0
                    END), 0)
                    + COALESCE(SUM(CASE
                        WHEN op.tip = 'POZITIV' THEN 2
                        WHEN op.tip = 'NEGATIV' THEN -1
                        ELSE 0
                    END), 0)
                )::numeric, 2)
            ) AS scor,
            CASE
                WHEN MAX(cc.frecventa) IS NOT NULL THEN
                    'Recomandat deoarece se potriveste cu categoriile vizualizate frecvent.'
                WHEN SUM(ac.frecventa) IS NOT NULL THEN
                    'Recomandat deoarece include actori pe care i-ai urmarit.'
                ELSE
                    'Recomandat pe baza popularitatii, ratingurilor si reactiilor clientilor.'
            END AS motiv
        FROM filme f
        LEFT JOIN categorii_client cc ON cc.id_categorie = f.id_categorie
        LEFT JOIN roluri r ON r.id_film = f.id
        LEFT JOIN actori_client ac ON ac.id_actor = r.id_actor
        LEFT JOIN vizualizari viz ON viz.id_film = f.id
        LEFT JOIN voturi vot ON vot.id_film = f.id
        LEFT JOIN comentarii com ON com.id_film = f.id
        LEFT JOIN client_optiuni co ON co.id_film = f.id
        LEFT JOIN optiuni_predefinite op ON op.id = co.id_optiune
        WHERE f.id NOT IN (SELECT id_film FROM filme_deja_vazute)
        GROUP BY f.id, f.rating
    )
    SELECT
        p_id_client,
        id_film,
        GREATEST(0, scor),
        motiv,
        CURRENT_DATE,
        'N'
    FROM scor_filme
    ORDER BY scor DESC, id_film
    LIMIT 10
    ON CONFLICT (id_client, id_film) DO UPDATE SET
        scor_compatibilitate = EXCLUDED.scor_compatibilitate,
        motiv = EXCLUDED.motiv,
        data_generare = CURRENT_DATE,
        vizualizata = 'N';

    RAISE NOTICE 'Recomandari generate in SQL pentru clientul id=%', p_id_client;
END;
$$;

