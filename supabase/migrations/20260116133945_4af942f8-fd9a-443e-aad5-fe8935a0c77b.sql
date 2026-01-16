-- Add DELETE and UPDATE policies for data_export_requests table
-- This allows users to manage their own export requests (GDPR compliance)

CREATE POLICY "Users can delete their own export requests"
  ON public.data_export_requests FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own export requests"
  ON public.data_export_requests FOR UPDATE
  USING (auth.uid() = user_id);