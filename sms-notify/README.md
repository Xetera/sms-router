# Sms Notify

Display your sms messages as notifications on your desktop.

Make sure to run `nvm use` to make sure you're using the node version specified in the plist

1. Install dependencies `pnpm i`
2. Build the project `pnpm build`
3. Create a `.plist` file for your service using `sh ./plist.sh [your-secret-key]`
4. Register the service `launchctl load ~/Library/LaunchAgents/dev.xetera.sms.plist`

Logs will be routed to `/var/log/sms-notify/out.txt` and `/var/log/sms-notify/error.txt`

If you run into any problems, I recommend installing LaunchControl to help debug the service.
