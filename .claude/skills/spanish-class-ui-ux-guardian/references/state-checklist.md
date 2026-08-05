# State Checklist

For each async or stateful surface verify:

- initial/default;
- loading/skeleton;
- empty;
- success;
- recoverable error and retry;
- validation error;
- stale/conflict response;
- disabled and reason;
- permission denied;
- expired/cancelled state where relevant;
- optimistic update rollback where used;
- screen-reader announcement for meaningful changes.
