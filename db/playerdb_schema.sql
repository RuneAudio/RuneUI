CREATE TABLE cfg_wifisec (
id INTEGER PRIMARY KEY,
ssid CHAR(50),
security CHAR(50),
password CHAR(50)
);
CREATE TABLE cfg_mpd (
id INTEGER PRIMARY KEY,
section CHAR(20),
param CHAR(20),
value CHAR(100),
description TEXT
, value_player char(200), value_default char(200), example char(200));
CREATE TABLE cfg_lan (
id INTEGER PRIMARY KEY,
name CHAR(5),
dhcp INTEGER(1),
ip CHAR(15),
netmask CHAR(15),
gw CHAR(15),
dns1 CHAR(15),
dns2 CHAR(15)
);
CREATE TABLE cfg_source (
id INTEGER PRIMARY KEY,
name CHAR(25),
type CHAR(8),
address CHAR(15),
remotedir CHAR(30),
username CHAR(30),
password CHAR(60),
charset CHAR(15),
rsize INT(4),
wsize INT(4)
, options CHAR(60), error CHAR(150));
CREATE UNIQUE INDEX IndexCfg_Source ON cfg_source (name);
CREATE TABLE cfg_plugins (
id INTEGER PRIMARY KEY,
name CHAR(25),
param CHAR(20),
value CHAR(100),
description TEXT
);
CREATE TABLE cfg_engine (
id INTEGER PRIMARY KEY,
param CHAR(10),
value CHAR(10)
);
