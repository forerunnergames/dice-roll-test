-- Add user emails view. --
CREATE VIEW public.user_emails AS
SELECT id, email FROM auth.users;

-- Lock down view access to service role only. --
REVOKE ALL ON public.user_emails FROM PUBLIC;
REVOKE ALL ON public.user_emails FROM authenticated;
REVOKE ALL ON public.user_emails FROM anon;
GRANT SELECT ON public.user_emails TO service_role;
