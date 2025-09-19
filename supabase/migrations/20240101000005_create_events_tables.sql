-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
CREATE POLICY "Enable read access for all users"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for event organizers"
  ON events FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Enable delete for event organizers"
  ON events FOR DELETE
  USING (auth.uid() = organizer_id);

-- Create policies for event_participants table
CREATE POLICY "Enable read access for all users"
  ON event_participants FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON event_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for own participation"
  ON event_participants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own participation"
  ON event_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to register for an event
CREATE OR REPLACE FUNCTION register_for_event(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_record events%ROWTYPE;
  participant_exists boolean;
  participant_status text;
  max_participants_reached boolean;
BEGIN
  -- Get the event
  SELECT * INTO event_record FROM events WHERE id = event_id;
  
  IF event_record.id IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
  
  -- Check if user is already registered
  SELECT EXISTS (
    SELECT 1 FROM event_participants 
    WHERE event_id = event_id AND user_id = auth.uid()
  ) INTO participant_exists;
  
  IF participant_exists THEN
    -- Get current status
    SELECT status INTO participant_status 
    FROM event_participants 
    WHERE event_id = event_id AND user_id = auth.uid()
    LIMIT 1;
    
    IF participant_status = 'confirmed' THEN
      RAISE EXCEPTION 'You are already registered for this event';
    ELSE
      -- Update status to confirmed
      UPDATE event_participants 
      SET status = 'confirmed', updated_at = NOW()
      WHERE event_id = event_id AND user_id = auth.uid();
      RETURN;
    END IF;
  END IF;
  
  -- Check if event has a participant limit
  IF event_record.max_participants > 0 THEN
    -- Check if there are available spots
    SELECT COUNT(*) >= event_record.max_participants 
    INTO max_participants_reached
    FROM event_participants 
    WHERE event_id = event_id AND status = 'confirmed';
    
    IF max_participants_reached THEN
      -- Add to waiting list
      INSERT INTO event_participants (event_id, user_id, status)
      VALUES (event_id, auth.uid(), 'waiting');
      
      -- Notify the user they're on the waiting list
      PERFORM pg_notify('events', 
        json_build_object(
          'type', 'waiting_list',
          'event_id', event_id,
          'user_id', auth.uid()
        )::text
      );
    ELSE
      -- Register for the event
      INSERT INTO event_participants (event_id, user_id, status)
      VALUES (event_id, auth.uid(), 'confirmed');
      
      -- Notify the user of successful registration
      PERFORM pg_notify('events', 
        json_build_object(
          'type', 'registration_success',
          'event_id', event_id,
          'user_id', auth.uid()
        )::text
      );
    END IF;
  ELSE
    -- No participant limit, just register
    INSERT INTO event_participants (event_id, user_id, status)
    VALUES (event_id, auth.uid(), 'confirmed');
    
    -- Notify the user of successful registration
    PERFORM pg_notify('events', 
      json_build_object(
        'type', 'registration_success',
        'event_id', event_id,
        'user_id', auth.uid()
      )::text
    );
  END IF;
  
  -- Notify the event organizer
  PERFORM pg_notify('events', 
    json_build_object(
      'type', 'new_participant',
      'event_id', event_id,
      'user_id', auth.uid(),
      'organizer_id', event_record.organizer_id
    )::text
  );
END;
$$;

-- Create a function to get events with participant count
CREATE OR REPLACE FUNCTION get_events_with_participant_count()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  location text,
  category text,
  price numeric,
  max_participants integer,
  cover_url text,
  organizer_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  participant_count bigint,
  is_registered boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_date::timestamptz,
    e.end_date::timestamptz,
    e.location,
    e.category,
    e.price,
    e.max_participants,
    e.cover_url,
    e.organizer_id,
    e.created_at::timestamptz,
    e.updated_at::timestamptz,
    COUNT(ep.id) FILTER (WHERE ep.status = 'confirmed') as participant_count,
    EXISTS (
      SELECT 1 FROM event_participants 
      WHERE event_id = e.id 
      AND user_id = auth.uid() 
      AND status = 'confirmed'
    ) as is_registered
  FROM events e
  LEFT JOIN event_participants ep ON e.id = ep.event_id
  GROUP BY e.id, e.title, e.description, e.start_date, e.end_date, e.location, 
           e.category, e.price, e.max_participants, e.cover_url, 
           e.organizer_id, e.created_at, e.updated_at
  ORDER BY e.start_date ASC;
$$;

-- Create a function to get event details with participants
CREATE OR REPLACE FUNCTION get_event_with_participants(event_id_param uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'event', (
      SELECT json_build_object(
        'id', e.id,
        'title', e.title,
        'description', e.description,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'location', e.location,
        'category', e.category,
        'price', e.price,
        'max_participants', e.max_participants,
        'cover_url', e.cover_url,
        'created_at', e.created_at,
        'updated_at', e.updated_at,
        'organizer', json_build_object(
          'id', p.id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'avatar_url', p.avatar_url,
          'company', p.company
        ),
        'participant_count', (
          SELECT COUNT(*) 
          FROM event_participants 
          WHERE event_id = e.id AND status = 'confirmed'
        ),
        'is_organizer', (e.organizer_id = auth.uid()),
        'is_registered', (
          SELECT status = 'confirmed' 
          FROM event_participants 
          WHERE event_id = e.id AND user_id = auth.uid()
        )
      )
      FROM events e
      LEFT JOIN profiles p ON e.organizer_id = p.id
      WHERE e.id = event_id_param
    ),
    'participants', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', p.id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'avatar_url', p.avatar_url,
          'company', p.company,
          'status', ep.status,
          'joined_at', ep.registration_date  -- Changé ici
        )
        ORDER BY 
          CASE WHEN ep.status = 'confirmed' THEN 0 ELSE 1 END,
          ep.registration_date ASC  -- Et ici
      ), '[]'::json)
      FROM event_participants ep
      JOIN profiles p ON ep.user_id = p.id
      WHERE ep.event_id = event_id_param
    )
    )
  );
$$;
