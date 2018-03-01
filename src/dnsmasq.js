const fs = require('fs');
const command = require('./commands');

const dnsConf = `interface=wlan0      # Use interface wlan0
listen-address=192.168.0.1 # Explicitly specify the address to listen on
bind-interfaces      # Bind to the interface to make sure we aren't sending things elsewhere
server=8.8.8.8       # Forward DNS requests to Google DNS
domain-needed        # Don't forward short names
bogus-priv           # Never forward addresses in the non-routed address spaces.
dhcp-range=192.168.0.50,192.168.0.150,12h # Assign IP addresses between 192.168.0.50 and 192.168.0.150 with a 12 hour lease time  `;

// const forwardReplacer = (match, p1, offset, string) => 'net.ipv4.ip_forward=1';
// const noForwardReplacer = (match, p1, offset, string) => '#net.ipv4.ip_forward=1';
const iptablesReplacer = (match, p1, offset, string) =>
  '\niptables-restore < /etc/iptables.ipv4.nat\n'.concat(p1);

const dnsmasqConf = () => {
  fs.access('/etc/dnsmasq.conf.orig', (err) => {
    if (!err) {
      console.log('dnsmasq[dnsmasq.conf] backup exists!!');
      return;
    }
    command('sudo cp /etc/dnsmasq.conf /etc/dnsmasq.conf.orig');
    console.log('dnsmasq[dnsmasq.conf] backup created!!');
    // fs.openSync('/etc/dnsmasq.conf', 'w');
    fs.writeFile('/etc/dnsmasq.conf', dnsConf, (error) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('dnsmasq[dnsmasq.conf] created!!');
    });
  });
};

const forward = () => {
  fs.readFile('/etc/sysctl.conf', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const notForwarding = data.match(/#net.ipv4.ip_forward=1/gi);
    if (notForwarding) {
      const newData = data.replace(/#net.ipv4.ip_forward=1/, 'net.ipv4.ip_forward=1');
      fs.writeFile('/etc/sysctl.conf', newData, (error) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log('"/etc/sysctl.conf" ipv4 forwarding!!');
      });
    } else {
      console.log('"/etc/sysctl.conf" already forwarding!!');
    }
  });
};

const iptables = () => {
  fs.access('/etc/iptables.ipv4.nat', (err) => {
    if (!err) {
      console.log('dnsmasq[iptables.ipv4.nat] already exists!!');
      return;
    }
    command('sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE');
    command('sudo iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT');
    command('sudo iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT');
    command('sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"');
  });
};

const rcLocal = () => {
  fs.readFile('/etc/rc.local', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const hasIPTables = data.match(/iptables-restore/gi);
    // console.log(data);
    if (!hasIPTables) {
      const newData = data.replace(/\n(exit 0)/, iptablesReplacer);
      // console.log(newData);
      fs.writeFile('/etc/rc.local', newData, (error) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log('dnsmasq[rc.local] done!!');
      });
    } else {
      console.log('dnsmasq[rc.local] already done!!');
    }
  });
};

const ipv4Forwarding = () => {
  forward();
  iptables();
  rcLocal();
};

exports.config = () => {
  dnsmasqConf();
  ipv4Forwarding();
};
