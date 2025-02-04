SELECT 
    n.id,
    n.title,
    n.message,
    n.notification_type,
    n.is_read,
    n.created_at,
    u.email as sender_email,
    u.username as sender_username,
    e.title as event_title,
    e.id as event_id
FROM notifications n
JOIN users u ON n.sender_id = u.id
LEFT JOIN events e ON n.event_id = e.id
WHERE n.recipient_id = %s
ORDER BY n.created_at DESC
LIMIT %s OFFSET %s;