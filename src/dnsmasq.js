const fs = require('fs');
const command = require('./commands');

const dnsConf = () => `interface=wlan0      # Use interface wlan0
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
      // return;
    } else {
      command('sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig');
      console.log('dnsmasq[dnsmasq.conf] backup created!!');
    }
    // fs.openSync('/etc/dnsmasq.conf', 'w');
    fs.writeFile('/etc/dnsmasq.conf', dnsConf(), (error) => {
      if (error) throw error;
    });
  });
};

const ipv4Forwarding = () => {
  fs.readFile('/etc/sysctl.conf', 'utf8', (err, data) => {
    if (err) throw err;
    const notForwarding = data.match(/#net.ipv4.ip_forward=1/gi);
    // console.log('forwarding: ', notForwarding);
    if (notForwarding) {
      const newData = data.replace(/#net.ipv4.ip_forward=1/, 'net.ipv4.ip_forward=1');
      // console.log('dnsmasq[sysctl.conf] ipv4Forwarding: ', newData);
      fs.writeFile('/etc/sysctl.conf', newData, (error) => {
        if (error) throw error;
        console.log('dnsmasq[sysctl.conf] ipv4 forwarding!!');
      })
      // command('sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"');
    }
  });

  /*
    IP forward settings
   */
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

  fs.readFile('/etc/rc.local', 'utf8', (err, data) => {
    if (err) throw err;
    const hasIPTables = data.match(/iptables-restore/gi);
    // console.log(data);
    if (!hasIPTables) {
      const newData = data.replace(/\n(exit 0)/, iptablesReplacer);
      // console.log(newData);
      fs.writeFile('/etc/rc.local', newData, (error) => {
        if (error) throw error;
        console.log('dnsmasq[rc.local] done!!');
      });
    }
  });
};

exports.config = () => {
  dnsmasqConf();
  ipv4Forwarding();
};
