#!/bin/bash

# Setup local hosts for multi-facility testing
# Run this with: sudo bash setup-local-hosts.sh

echo "Adding facility subdomains to /etc/hosts..."

cat >> /etc/hosts << 'EOF'

# iHosi Multi-Facility Testing
127.0.0.1 mayo-clinic.localhost
127.0.0.1 cleveland-clinic.localhost
127.0.0.1 stanford-medical.localhost
127.0.0.1 johns-hopkins.localhost
127.0.0.1 mass-general.localhost
127.0.0.1 ucla-medical.localhost
127.0.0.1 ucsf-medical.localhost
127.0.0.1 newyork-presbyterian.localhost
127.0.0.1 cedars-sinai.localhost
127.0.0.1 duke-university.localhost
127.0.0.1 admin.localhost
EOF

echo "✅ Local hosts configured!"
echo ""
echo "You can now test:"
echo "  http://mayo-clinic.localhost:3000"
echo "  http://cleveland-clinic.localhost:3000"
echo "  http://stanford-medical.localhost:3000"
echo "  etc..."

