ALTER TABLE leads ADD COLUMN meta_event_id TEXT;
ALTER TABLE leads ADD COLUMN meta_consent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN meta_capi_status TEXT NOT NULL DEFAULT 'skipped';

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_meta_event_id ON leads(meta_event_id);
