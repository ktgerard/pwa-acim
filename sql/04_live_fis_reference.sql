-- ACIM Phase 1C.2: live FIS reference, read-only RPC endpoints.
-- Run as Supabase project administrator. Does NOT alter FIS tables or their RLS policies.
CREATE OR REPLACE FUNCTION public.acim_list_fis_heads()
RETURNS TABLE(head_id text, club_type text, oem text, model text, release_year smallint, variant text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT public.acim_is_authorized() THEN
   RAISE EXCEPTION 'Not authorized for ACIM reference data' USING ERRCODE='42501';
 END IF;
 RETURN QUERY SELECT h."HeadID",h."ClubType",h."OEM",h."Model",h."ReleaseYear",h."Variant"
 FROM public."HeadDB" h
 WHERE h."HeadID" IS NOT NULL AND h."ClubType" IN ('Driver','Fairway','Hybrid','Iron','Wedge','Putter');
END $$;
REVOKE ALL ON FUNCTION public.acim_list_fis_heads() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.acim_list_fis_heads() TO authenticated;

CREATE OR REPLACE FUNCTION public.acim_list_fis_lofts(p_head_id text)
RETURNS TABLE(loft numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT public.acim_is_authorized() THEN
   RAISE EXCEPTION 'Not authorized for ACIM reference data' USING ERRCODE='42501';
 END IF;
 RETURN QUERY SELECT DISTINCT s."Loft" FROM public."ClubSpecsDB" s
 WHERE s."HeadID"=p_head_id AND s."Loft" IS NOT NULL ORDER BY s."Loft";
END $$;
REVOKE ALL ON FUNCTION public.acim_list_fis_lofts(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.acim_list_fis_lofts(text) TO authenticated;
