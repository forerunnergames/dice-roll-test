-- Seed today's pot for local development.
INSERT INTO public.pots (date, amount) VALUES (CURRENT_DATE, 500)
ON CONFLICT (date) DO NOTHING;
