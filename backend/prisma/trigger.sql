-- Create a generic trigger function that notifies on the 'data_changes' channel
CREATE OR REPLACE FUNCTION notify_trigger() RETURNS trigger AS $$
DECLARE
  payload JSON;
  rec RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN
    rec := OLD;
  ELSE
    rec := NEW;
  END IF;

  -- Construct a JSON payload with the table name, operation, and the affected row's data
  payload = json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'data', row_to_json(rec)
  );

  -- Perform the notification
  PERFORM pg_notify('data_changes', payload::text);
  
  RETURN rec;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to Rating
DROP TRIGGER IF EXISTS rating_notify_trigger ON "Rating";
CREATE TRIGGER rating_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Rating"
FOR EACH ROW EXECUTE FUNCTION notify_trigger();

-- Attach the trigger to Store
DROP TRIGGER IF EXISTS store_notify_trigger ON "Store";
CREATE TRIGGER store_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Store"
FOR EACH ROW EXECUTE FUNCTION notify_trigger();

-- Attach the trigger to User
DROP TRIGGER IF EXISTS user_notify_trigger ON "User";
CREATE TRIGGER user_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON "User"
FOR EACH ROW EXECUTE FUNCTION notify_trigger();
