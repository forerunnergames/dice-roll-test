-- Rolls table
CREATE TABLE public.rolls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    result INTEGER[] NOT NULL CHECK (
        array_ndims(result) = 1
        AND cardinality(result) = 5
        AND array_position(result, NULL) IS NULL
        AND result <@ ARRAY[1, 2, 3, 4, 5, 6]::INTEGER[]
    ),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    qualified BOOLEAN GENERATED ALWAYS AS (
        result[1] = result[2] AND
        result[2] = result[3] AND
        result[3] = result[4] AND
        result[4] = result[5]
        ) STORED,
    roll_date DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE UNIQUE INDEX idx_rolls_user_date ON public.rolls (user_id, roll_date);

-- Pots table
CREATE TABLE public.pots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    amount INTEGER DEFAULT 500 NOT NULL,
    winner_id UUID REFERENCES auth.users(id),
    closed BOOLEAN DEFAULT false NOT NULL
);

-- Enable RLS
ALTER TABLE public.rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pots ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only insert their own rolls for today.
-- qualified is a generated column computed from result, so it can't be faked.
CREATE POLICY "Users can insert their own rolls"
    ON public.rolls FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND roll_date = CURRENT_DATE
    );

-- RLS: Users can only read their own rolls
CREATE POLICY "Users can read their own rolls"
    ON public.rolls FOR SELECT
    USING (auth.uid() = user_id);

-- RLS: Pots are publicly readable
CREATE POLICY "Pots are publicly readable"
    ON public.pots FOR SELECT
    USING (true);

-- Winner selection function (SECURITY DEFINER = runs with owner privileges)
CREATE OR REPLACE FUNCTION public.select_daily_winner(target_date DATE)
RETURNS UUID AS $$
DECLARE
    winner UUID;
    already_closed BOOLEAN;
BEGIN
    -- Lock the pot row to prevent concurrent calls from picking different winners.
    -- Fail if no pot row exists for this date (cron should have created it).
    SELECT closed, winner_id INTO already_closed, winner
    FROM public.pots
    WHERE date = target_date
    FOR UPDATE; -- Lock the row during SELECT + (later) UPDATE to allow only one caller at a time.

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No pot found for date %', target_date;
    END IF;

    -- If pot is already closed, return the existing winner.
    IF already_closed THEN
        RETURN winner;
    END IF;

    -- Pick a random qualified roller.
    SELECT user_id INTO winner
    FROM public.rolls
    WHERE roll_date = target_date AND qualified = true
    -- TODO Support multiple winners, or smart winner selection.
    ORDER BY random()
    LIMIT 1;

    -- Close the pot, whether or not there's a winner.
    IF winner IS NOT NULL THEN
        UPDATE public.pots
        SET winner_id = winner, closed = true
        WHERE date = target_date;
    ELSE
        UPDATE public.pots
        SET closed = true
        WHERE date = target_date;
    END IF;

    RETURN winner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
-- Only search the public schema for this function, to prevent search path injection attacks.
SET search_path = public;
-- Prevent any authenticated user from executing the function.
REVOKE EXECUTE ON FUNCTION public.select_daily_winner(DATE) FROM PUBLIC;
-- Allow cron job to trigger the function.
GRANT EXECUTE ON FUNCTION public.select_daily_winner(DATE) TO service_role;