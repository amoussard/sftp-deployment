"use babel";

import ConnectionFactory from "../lib/connections/ConnectionFactory";
import SftpConnection from "../lib/connections/SftpConnection";
import FtpConnection from "../lib/connections/FtpConnection";
import Config from "../lib/configs/Config";

describe("ConnectionFactory", () => {
  let factory;
  let config;

  beforeEach(() => {
    factory = new ConnectionFactory();
    config = new Config();
  });

  it("creates an SFTP connection", (done) => {
    config.port = 22;

    factory.createConnection(config).then((connection) => {
      expect(connection instanceof SftpConnection).toBeTruthy();
    }).
      then(done, done);
  });

  it("creates an FTP connection", (done) => {
    config.port = 21;

    factory.createConnection(config).then((connection) => {
      expect(connection instanceof FtpConnection).toBeTruthy();
    }).
      then(done, done);
  });
});

