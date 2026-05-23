--Scriptul pentru Triggerele custom

--Trigger 1: Recalculeaza rating-ul unui film la INSERT/UPDATE/DELETE

CREATE OR REPLACE FUNCTION fn_recalculeaza_rating()
    RETURNS TRIGGER AS $$
DECLARE
    v_id_film INTEGER;
    v_nou_rating DECIMAL(4,2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_id_film := OLD.id_film;
    ELSE
        v_id_film := NEW.id_film;
    END IF;
    --calculam media voturilor
    SELECT COALESCE(ROUND(AVG(valoare)::DECIMAL,2),0)
    INTO v_nou_rating
    FROM VOTURI
    WHERE id_film = v_id_film;

    --actualizam ratingul in tabela filme
    UPDATE FILME SET rating = v_nou_rating WHERE id = v_id_film;
    RAISE NOTICE 'Rating actualizat pentru film id=% -> %', v_id_film, v_nou_rating;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalculeaza_rating ON VOTURI;
CREATE TRIGGER trg_recalculeaza_rating
    AFTER INSERT OR UPDATE OR DELETE
    ON VOTURI
    FOR EACH ROW
EXECUTE FUNCTION fn_recalculeaza_rating();

--Trigger 2: Analiza sentiment comentarii (se actualizeaza pe baza cuvintelor cheie)
CREATE OR REPLACE FUNCTION fn_analiza_sentiment()
    RETURNS TRIGGER AS $$
DECLARE
    v_text TEXT;
    v_pozitive INTEGER := 0;
    v_negative INTEGER := 0;
    cuvant TEXT;
BEGIN
    v_text := lower(COALESCE(NEW.text_comentariu,''));
    v_text := translate(
        v_text,
        'ăâîșşțţáéíóúàèìòùäëïöü',
        'aaissttaeiouaeiouaeiou'
    );

    -- expresii negative se calculeaza primele ca sa nu fie anulate de "recomand" / "placut"
    FOR cuvant IN SELECT unnest(ARRAY[
        'nu recomand', 'nu as recomanda', 'nu mi-a placut', 'nu mia placut',
        'nu merita', 'pierdere de timp', 'foarte slab', 'foarte prost',
        'scenariu slab', 'acting slab', 'actor slab'
    ]) LOOP
        IF v_text LIKE '%' || cuvant || '%' THEN
            v_negative := v_negative + 3;
        END IF;
    END LOOP;

    FOR cuvant IN SELECT unnest(ARRAY[
        'excelent', 'extraordinar', 'exceptional', 'minunat', 'superb',
        'fantastic', 'spectaculos', 'impecabil', 'captivant', 'recomand',
        'recomandat', 'mi-a placut', 'mia placut', 'placut', 'perfect',
        'uimitor', 'genial', 'emotionant', 'frumos', 'interesant',
        'apreciat', 'bun', 'foarte bun', 'tare', 'super', 'ador',
        'capodopera', 'merita', 'merita vazut', 'actor bun', 'actori buni',
        'scenariu bun', 'poveste buna'
        ]) LOOP
            IF v_text LIKE '%' || cuvant || '%' THEN
                v_pozitive := v_pozitive + 1;
            END IF;
        END LOOP;

    FOR cuvant IN SELECT unnest(ARRAY[
        'slab', 'plictisitor', 'dezamagitor', 'rau', 'groaznic', 'oribil',
        'plictisit', 'previzibil', 'enervant', 'prostesc', 'stupid',
        'waste', 'boring', 'teribil', 'nasol', 'dezamagit', 'dezamagire',
        'mediocru', 'prost', 'prost facut', 'jalnic', 'lent', 'confuz',
        'neinteresant', 'iritant'
        ]) LOOP
            IF v_text LIKE '%' || cuvant || '%' THEN
                v_negative := v_negative + 1;
            END IF;
        END LOOP;

    IF NEW.sentiment IN ('POZITIV', 'NEGATIV', 'NEUTRU')
       AND COALESCE(NEW.text_comentariu, '') = '' THEN
        RETURN NEW;
    ELSIF v_pozitive > v_negative THEN
        NEW.sentiment := 'POZITIV';
    ELSIF v_negative > v_pozitive THEN
        NEW.sentiment := 'NEGATIV';
    ELSE
        NEW.sentiment := 'NEUTRU';
    END IF;

    RAISE NOTICE 'Sentiment detectat: % (pozitive=%, negative=%) pentru comentariu id=%',
        NEW.sentiment, v_pozitive, v_negative, NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_analiza_sentiment ON COMENTARII;
CREATE TRIGGER trg_analiza_sentiment
    BEFORE INSERT OR UPDATE OF text_comentariu
    ON COMENTARII
    FOR EACH ROW
EXECUTE FUNCTION fn_analiza_sentiment();

-- Recalculeaza sentimentele deja salvate dupa instalarea versiunii noi a triggerului.
UPDATE COMENTARII
SET text_comentariu = text_comentariu;
