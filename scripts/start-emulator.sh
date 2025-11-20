#!/bin/bash

# Start firebase emulators in the background
# We remove the import/export flags as requested
firebase emulators:start &
EMULATOR_PID=$!

# Function to handle cleanup when the script is stopped (e.g. Ctrl+C)
cleanup() {
    echo "Stopping emulator..."
    kill $EMULATOR_PID
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Waiting for emulator to start..."

# Wait for Auth (9099) and Firestore (8080) ports to be open
# We use a loop with a timeout to avoid infinite waiting
MAX_RETRIES=60
count=0

check_ports() {
    nc -z localhost 9099 && nc -z localhost 8080
}

while ! check_ports; do
    sleep 1
    count=$((count+1))
    if [ $count -ge $MAX_RETRIES ]; then
        echo "Timeout waiting for emulator to start."
        kill $EMULATOR_PID
        exit 1
    fi
done

echo "Emulator started! Running seed script..."
npm run seed

echo "Seed completed. Emulator is running. Press Ctrl+C to stop."

# Wait for the emulator process to finish (it won't unless stopped)
wait $EMULATOR_PID
