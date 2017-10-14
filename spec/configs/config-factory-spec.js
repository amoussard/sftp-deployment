"use babel";

import ConfigFactory from "../../lib/configs/ConfigFactory";
import ConfigurationFileSyntaxErrorException from "../../lib/exceptions/ConfigurationFileSyntaxErrorException";

describe("ConfigFactory", () => {
  let factory;

  beforeEach(() => {
    factory = new ConfigFactory();
  });

  it("creates an SFTP config", () => {
    const config = factory.createSftpConfig();

    expect(config.port).toEqual(22);
  });

  it("creates an FTP config", () => {
    const config = factory.createFtpConfig();

    expect(config.port).toEqual(21);
  });

  it("parses a config file content", (done) => {
    const content = `
      {
        "port": 1234
      }
    `;

    factory.parseConfigFile(content).then((connection) => {
      expect(connection.port).toEqual(1234);
    })
      .then(done, done);
  });

  it("rejects invalid config files", (done) => {
    const invalidContent = "invalid-json";

    factory.parseConfigFile(invalidContent).catch((error) => {
      expect(error instanceof ConfigurationFileSyntaxErrorException).toBeTruthy();
    })
      .then(done, done);
  });
});

