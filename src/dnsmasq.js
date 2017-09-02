const fs = require('fs');
const command = require('./commands');

const dnsmasqConf = () => `interface=wlan0      # Use interface wlan0
listen-address=10.10.1.1 # Explicitly specify the address to listen on
bind-interfaces      # Bind to the interface to make sure we aren't sending things elsewhere
server=8.8.8.8       # Forward DNS requests to Google DNS
domain-needed        # Don't forward short names
bogus-priv           # Never forward addresses in the non-routed address spaces.
dhcp-range=10.10.1.50,10.10.1.150,12h # Assign IP addresses between 10.10.1.50 and 10.10.1.150 with a 12 hour lease time  `

const forwardReplacer = (match, p1, offset, string) => 'net.ipv4.ip_forward=1';
const noForwardReplacer = (match, p1, offset, string) => '#net.ipv4.ip_forward=1';
const iptablesReplacer = (match, p1, offset, string) =>
  '\niptables-restore < /etc/iptables.ipv4.nat\n'.concat(p1);

exports.config = (asHotspot) => {
  if (asHotspot) {
    fs.writeFile('/etc/dnsmasq.conf', dnsmasqConf(), (err) => {
      if (err) throw err;
      console.log('Dnsmasq conf... done!!');
    })
  }

  fs.readFile('/etc/sysctl.conf', 'utf8', (err, data) => {
    if (err) throw err;
    const notForwarding = data.match(/(#net.ipv4.ip_forward=1)/gi);
    // console.log('forwarding: ', notForwarding);
    if (notForwarding) {
      const newData = data.replace(/(#net.ipv4.ip_forward=1)/, forwardReplacer);
      fs.writeFile('/etc/sysctl.conf', newData, (err) => {
        if (err) throw err;
        console.log('sysctl.conf forwarding!!');
      })
      command('sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"');
    }
  });

  /*
    IP forward settings
   */
  fs.access('/etc/iptables.ipv4.nat', (err) => {
    if (!err) {
      console.log('iptables.ipv4.nat already exists!!');
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
      fs.writeFile('/etc/rc.local', newData, (err) => {
        if (err) throw err;
        console.log('rc.local iptables-restore!!');
      })
    }
  });

};
