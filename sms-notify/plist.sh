#!/bin/bash

sudo mkdir -p "/var/log/sms-notify"

cat <<-EOF > ~/Library/LaunchAgents/dev.xetera.sms.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>dev.xetera.sms</string>

    <key>ServiceDescription</key>
    <string>SmsRouter service for displaying SMS messages as macos notifications</string>

    <key>ProgramArguments</key>
    <array>
      <string>/Users/$(whoami)/.nvm/versions/node/v20.2.0/bin/node</string>
      <string>$(pwd)/dist/index.js</string>
      <string>$1</string>
    </array>

    <key>StandardOutPath</key>
    <string>/var/log/sms-notify/out.txt</string>

    <key>StandardErrorPath</key>
    <string>/var/log/sms-notify/error.txt</string>

    <key>EnvironmentVariables</key>
    <dict>
      <key>PATH</key>
      <string>/usr/local/bin/:/usr/bin/</string>
    </dict>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>WorkingDirectory</key>
    <string>$(pwd)</string>
  </dict>
</plist>
EOF

chown $(whoami) ~/Library/LaunchAgents/dev.xetera.sms.plist
