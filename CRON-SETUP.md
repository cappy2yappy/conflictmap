# Nightly Build Cron Setup

## Manual Cron Setup (One-Time)

Add this to your crontab to run ConflictMap builds at 2 AM daily:

```bash
# Open crontab editor
crontab -e

# Add this line:
0 2 * * * /Users/cappy/.openclaw/workspace/scripts/conflictmap-nightly.sh >> /Users/cappy/.openclaw/workspace/logs/conflictmap-nightly.log 2>&1

# Save and exit
```

## Verify Cron is Set

```bash
crontab -l | grep conflictmap
```

## View Build Logs

```bash
tail -f /Users/cappy/.openclaw/workspace/logs/conflictmap-nightly.log
```

## Build Script Location

`/Users/cappy/.openclaw/workspace/scripts/conflictmap-nightly.sh`

Already created and ready to use.
